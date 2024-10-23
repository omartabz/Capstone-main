import express from 'express';
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import cors from 'cors';
// import { carbonTotal } from './CarbonDatabase/carbonTotal.js';
const app = express();



app.use(express.static('public'))
app.use(express.json())
app.use(cors())


const db = await sqlite.open({
    filename: './carbon.db',
    driver: sqlite3.Database
})


await db.migrate();

// Sample transaction data (Add necessary fields for new rules)
const transaction = {
    id: '123456',
    amount: 15000,
  
  };
  
  // Fraud detection rules including new rules
  const fraudRules = [
    {
      ruleId: '1',
      description: 'Transaction amount exceeds limit',
      field: 'amount',
      operator: '>',
      value: 10000
    },
    // {
    //   ruleId: '2',
    //   description: 'Transaction from unusual location',
    //   field: 'location',
    //   operator: 'not-in',
    //   value: ['New York', 'Los Angeles', 'San Francisco']
    // },
    {
      ruleId: '3',
      description: 'Transaction during odd hours',
      field: 'timestamp',
      operator: 'time-range',
      value: { start: '12:00', end: '16:00' }
    },
    {
      ruleId: '4',
      description: 'Too many transactions in a short period',
      field: 'velocity',
      operator: '>',
      value: 2  // More than 5 transactions in a short window
    },
    // {
    //   ruleId: '5',
    //   description: 'Currency mismatch',
    //   field: 'currency',
    //   operator: '!=',
    //   value: 'USD'  // Assuming user regularly transacts in USD
    // },
    // {
    //   ruleId: '6',
    //   description: 'Unusual device/browser',
    //   field: 'device',
    //   operator: 'not-in',
    //   value: ['iPhone', 'Chrome', 'Firefox']  // User's common devices or browsers
    // },
    // {
    //   ruleId: '7',
    //   description: 'Card not present for physical purchase',
    //   field: 'cardPresent',
    //   operator: '==',
    //   value: false  // Card must be present for physical purchase
    // },
    // {
    //   ruleId: '8',
    //   description: 'IP address location mismatch',
    //   field: 'ipLocation',
    //   operator: '!=',
    //   value: 'USA'  // User's registered billing address
    // }
  ];
  
  // Updated function to evaluate rules
  function evaluateRule(rule, transaction) {
    const fieldValue = transaction[rule.field];
  
    switch (rule.operator) {
      case '>':
        return fieldValue > rule.value;
      case '!=':
        return fieldValue !== rule.value;
      case 'not-in':
        return !rule.value.includes(fieldValue);  // Check if not in the allowed list
      case '==':
        return fieldValue === rule.value;
      case 'time-range': {
        const transactionTime = new Date(transaction.timestamp).toLocaleTimeString('en-GB', { hour12: false });
        return transactionTime >= rule.value.start || transactionTime <= rule.value.end;
      }
      default:
        return false;
    }
  }
  
  // Function to check all rules for fraud detection
  function checkFraud(transaction, rules) {
    let suspicious = false;
    const violatedRules = [];
  
    rules.forEach(rule => {
      if (evaluateRule(rule, transaction)) {
        suspicious = true;
        violatedRules.push(rule.description);
      }
    });
  
    return {
      isFraud: suspicious,
      violatedRules: violatedRules
    };
  }

app.get('/api/carbon/projects', async (req, res) => {
    const { projects } = req.body
    const allProjects = await db.all(`SELECT * FROM projects`);
    console.log(...allProjects);
    res.status(200).json({...allProjects});
})

app.post('/api/carbon/add', async (req, res) => {
    const { project_id, project_name, scope, total_credits_available, total_credits_issued } = req.body
    const total = await db.get(`INSERT INTO projects (project_id,project_name,scope,total_credits_available,total_credits_issued) VALUES (?,?,?,?,?)`, [project_id, project_name, scope, total_credits_available, total_credits_issued]);
    res.status(200).json({ message: 'Project Created Successfully' });
})

app.post('/api/carbon/delete', async (req, res) => {
    const { project_id } = req.body;
    const total = await db.run(`DELETE FROM projects WHERE project_id =?`, [project_id]);
    res.status(200).json({ message: 'Project Deleted Successfully' });
})

app.post('/api/carbon/update', async (req, res) => {
    const { project_id, project_name, scope, total_credits_available, total_credits_issued } = req.body
    const total = await db.run(`UPDATE projects SET project_id = ?,project_name = ?,scope = ?,total_credits_available = ?,total_credits_issued = ? WHERE project_id = ?`, [project_id, project_name, scope, total_credits_available, total_credits_issued, project_id]);
    res.status(200).json({ message: 'Project Updated Successfully' });
})

app.post('/api/carbon/seller', async (req, res) => {
    const { total_credits_available } = req.body
    const allProjects = await db.all(`SELECT project_id, project_name,scope,  MAX (total_credits_available) FROM projects WHERE total_credits_available < ?`,[total_credits_available]);
    res.status(200).json({...allProjects});
})
let velocity = 0;
// Endpoint to submit a transaction (POST /api/transactions)
app.post('/api/transactions', (req, res) => {
    const { amount, userId } = req.body;

    //todo: work around velocity rule - short period of time
    const transaction = {
        amount, userId, timestamp: new Date()
    }
    // Database operation to insert the transaction
    db.run(`INSERT INTO transactions (userId, amount) VALUES (?, ?)`, [userId, amount], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const transactionId = this.lastID;
        // const fraudAlert = checkFraud(transaction, fraudRules) //amount > 1000 ? { message: "High transaction amount detected!", severity: "high" } : null;
        const result = checkFraud(transaction, fraudRules);
        if (result.isFraud) {
           
            // console.log(`Transaction flagged as suspicious. Violated rules: ${result.violatedRules.join(', ')}`);
            let fraudAlert = {
                message: `Transaction flagged as suspicious. Violated rules: ${result.violatedRules.join(', ')}`,
                severity: 'high'
            }
             db.run(`INSERT INTO fraud_alerts (transactionId, message, severity) VALUES (?, ?, ?)`, [transactionId, fraudAlert.message, fraudAlert.severity], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
            });
            res.json({ transactionId, alerts: [fraudAlert] });
        } else {
            console.log('Transaction is clean.');
            res.json({ transactionId, alerts: [
                {
                    message: 'Transaction is clean.',
                    severity: 'low'
                }
            ] });
        }

    });
});

const PORT = process.env.PORT || 4003
app.listen(PORT, () => console.log(`Server started ${PORT}`))

