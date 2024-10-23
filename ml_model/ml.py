from sklearn.metrics import accuracy_score
import pandas as pd
from sklearn import metrics #Import scikit-learn metrics module for accuracy calculatio
import re
import  numpy as np
import pandas as pd
import hashlib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import accuracy_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor

import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_excel(r'./issurance_tracker.csv (1).xlsx')

def preprocess(input_val):
    if isinstance(input_val, str):
        output = re.sub('\s+',' ', input_val)
        output = output.strip()
        return output
    else: return input_val

df.head(10)

label_encoder = LabelEncoder()

df['Project ID'] = label_encoder.fit_transform(df['Project ID'])
df['Project ID'].unique()

df['Scope'] = label_encoder.fit_transform(df['Scope'])
df['Scope'].unique()

df['Voluntary Status'] = label_encoder.fit_transform(df['Voluntary Status'])
df['Voluntary Status'].unique()

df['Reduction / Removal'] = label_encoder.fit_transform(df['Reduction / Removal'])
df['Reduction / Removal'].unique()

df.columns

rows, columns = df.shape

df.info()

df.describe()

df.isnull().sum()

df.fillna(0, inplace=True)

desired_columns = ["Total Credits Issued", "Total Credits Retired","Reduction / Removal","Voluntary Status","Scope","Project ID", "Total Credits Remaining",
                   "First Year of Project (Vintage)","Region","1996.1","1997.1","1998.1","1999.1","2000.1","2001.1","2002.1","2003.1","2004.1","2005.1","2006.1","2007.1","2008.1","2009.1","2010.1","2011.1","2012.1","2013.1","2014.1","2015.1","2016.1","2017.1","2018.1","2019.1","2020.1","2021.1","2022.1","2023.1","2024.1","1996.2","1997.2","1998.2","1999.2","2000.2","2001.2","2002.2","2003.2","2004.2","2005.2","2006.2","2007.2","2008.2","2009.2","2010.2","2011.2","2012.2","2013.2","2014.2","2015.2","2016.2","2017.2","2018.2","2019.2","2020.2","2021.2","2022.2","2023.2","2024.2","1997.3","1998.3","1999.3","2000.3","2001.3","2002.3","2003.3","2004.3","2005.3","2006.3","2007.3","2008.3","2009.3","2010.3","2011.3","2012.3","2013.3","2014.3","2015.3","2016.3","2017.3","2018.3","2019.3","2020.3","2021.3", "2022.3","2023.3","2024.3","Reversals Covered by Buffer Pool","Reversals Not Covered by Buffer"]

features = [col for col in desired_columns]
target = "Total Credits Retired"

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
#Play around with X, y, test_size=0.2, random_state=43 and insert different vslues for different results

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import RandomizedSearchCV, GridSearchCV
from sklearn.svm import SVR

svm_model = SVR()
svm_model.fit(X_train_scaled, y_train)


# svm_accuracy = accuracy_score(y_test, svm_model.predict(X_test_scaled))

from sklearn.metrics import mean_squared_error, r2_score

# Calculate Mean Squared Error (MSE)
svm_mse = mean_squared_error(y_test, svm_model.predict(X_test_scaled))

# Calculate R-squared score
svm_r2 = r2_score(y_test, svm_model.predict(X_test_scaled))

print(f"SVM Mean Squared Error: {svm_mse}")
print(f"SVM R-squared: {svm_r2}")

knn_model = KNeighborsRegressor(n_neighbors=5)
knn_model.fit(X_train_scaled, y_train)

# knn_accuracy = accuracy_score(y_test, knn_model.predict(X_test_scaled))
# Calculate Mean Squared Error (MSE)
knn_mse = mean_squared_error(y_test, knn_model.predict(X_test_scaled))

# Calculate R-squared score
knn_r2 = r2_score(y_test, knn_model.predict(X_test_scaled))

print(f"KNN Mean Squared Error: {knn_mse}")
print(f"KNN R-squared: {knn_r2}")

rfc_model = RandomForestRegressor()
rfc_model.fit(X_train_scaled, y_train)
rfc_mse = mean_squared_error(y_test, rfc_model.predict(X_test_scaled))

# Calculate R-squared score
rfc_r2 = r2_score(y_test, rfc_model.predict(X_test_scaled))

print(f"RFC Mean Squared Error: {rfc_mse}")
print(f"RFC R-squared: {rfc_r2}")

dtc_model = DecisionTreeRegressor()
dtc_model.fit(X_train_scaled, y_train)
dtc_mse = mean_squared_error(y_test, dtc_model.predict(X_test_scaled))

# Calculate R-squared score
dtc_r2 = r2_score(y_test, dtc_model.predict(X_test_scaled))

print(f"DTC Mean Squared Error: {dtc_mse}")
print(f"DTC R-squared: {dtc_r2}")

lr_model = LinearRegression()
lr_model.fit(X_train_scaled, y_train)
lr_mse = mean_squared_error(y_test, lr_model.predict(X_test_scaled))

# Calculate R-squared score
lr_r2 = r2_score(y_test, lr_model.predict(X_test_scaled))

print(f"LR Mean Squared Error: {lr_mse}")
print(f"LR R-squared: {lr_r2}")

xgb_model = GradientBoostingRegressor()
xgb_model.fit(X_train_scaled, y_train)
xgb_mse = mean_squared_error(y_test, xgb_model.predict(X_test_scaled))

# Calculate R-squared score
xgb_r2 = r2_score(y_test, xgb_model.predict(X_test_scaled))

print(f"XGB Mean Squared Error: {xgb_mse}")
print(f"xgb R-squared: {xgb_r2}")

models = ['XGB', 'KNN','RFC','DTC','LR' ]
accuracies = [xgb_r2, knn_r2, rfc_r2, dtc_r2, lr_r2]
plt.bar(models, accuracies, color=['red', 'yellow','blue','green','brown'])
#Change colour if you want
plt.xlabel('Models')
plt.ylabel('Accuracy')
plt.title('Comparison of All 5 Models')
plt.ylim(0, 1)
plt.show()

print("SVM Accuracy:", svm_r2)
print("KNN Accuracy:", knn_r2)
print("RFC Accuracy:", rfc_r2)
print("DTC Accuracy:", dtc_r2)
print("LR Accuracy:", lr_r2)
print("XGB Accuracy:", xgb_r2)
#XGB,RFC and LR have highest accuracies of 96% plus
