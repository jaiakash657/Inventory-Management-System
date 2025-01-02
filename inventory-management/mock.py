import pandas as pd
import matplotlib.pyplot as plt

data = pd.read_csv("data.csv")

print(data.head())

top_selling_categories = data.groupby('Item_Type')['Item_Outlet_Sales'].sum().sort_values(ascending=False).head(10)

print("Top 10 Selling Product Categories:")
print(top_selling_categories)

plt.figure(figsize=(10, 6))
top_selling_categories.plot(kind='bar', color='skyblue')
plt.title('Top 10 Selling Product Categories')
plt.xlabel('Product Category (Item Type)')
plt.ylabel('Total Sales')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.show()
