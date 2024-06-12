import pandas as pd

# Load the Excel file
file_path = r'Elements of Neoverse.xlsx'
data = pd.read_excel(file_path, sheet_name=None)

# Load each sheet
sheet1 = data['Sheet1']
sheet2 = data['Sheet2']

# Drop unnamed columns
sheet1 = sheet1.loc[:, ~sheet1.columns.str.contains('^Unnamed')]
sheet2 = sheet2.loc[:, ~sheet2.columns.str.contains('^Unnamed')]

# Define column names, including the additional column for sheet1
columns_sheet1 = [
    "Element Name", "Nuclei Type", "Subcharge", "Sauze T", "Gravs A", "Change Rate", "Ennums",
    "Negatrons", "Positrons", "Tempotrons", "Neutrons", "Statictrons", "Electrons", "Ambientrons",
    "Matter Type", "Type of Matter Type", "The Correct one"
]
columns_sheet2 = [
    "Element Name", "Nuclei Type", "Subcharge", "Sauze T", "Gravs A", "Compact", "Change Rate", 
    "Ennums", "Matter Type", "Type of Matter Type"
]

# Set proper column names for each sheet
sheet1.columns = columns_sheet1
sheet2.columns = columns_sheet2

# Convert the DataFrame to dictionaries
sheet1_dict = sheet1.to_dict(orient='records')
sheet2_dict = sheet2.to_dict(orient='records')

# Combine the dictionaries into a nested structure
elements_data = {}

# Function to add data to the nested dictionary
def add_to_dict(element_data, target_dict):
    element_name = element_data.pop("Element Name")
    nuclei_type = element_data.pop("Nuclei Type")
    
    if element_name not in target_dict:
        target_dict[element_name] = {}
        
    if nuclei_type not in target_dict[element_name]:
        target_dict[element_name][nuclei_type] = []
        
    target_dict[element_name][nuclei_type].append(element_data)

# Adding data from both sheets to the nested dictionary
for record in sheet1_dict:
    add_to_dict(record, elements_data)

for record in sheet2_dict:
    add_to_dict(record, elements_data)

import json

# Display the final nested dictionary
json_formatted_str = json.dumps(elements_data, indent=2)
print(json_formatted_str)
