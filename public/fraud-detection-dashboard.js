document.getElementById('submit-transaction').addEventListener('click', () => {
    const amount = document.getElementById('amount').value;
    console.log(amount);
    const userId = document.getElementById('userId').value;
    console.log(userId);

    fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, userId }),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);

            const alerts = data.alerts.map(alert => `<li>${alert.message} (Severity: ${alert.severity})</li>`).join('');
            document.getElementById('alert-result').innerHTML = `<ul>${alerts}</ul>`;
        })
        .catch(error => console.error('Error:', error));
});

