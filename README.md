# NYC MCI Map

This is an interactive map displaying all buildings in NYC that had/have a Major Capital Improvements application with 
the New York State Division of Homes and Community Renewal (HCR) anytime from 2010-2020. Click [here](https://wshenyc.github.io/nyc_mci_map/) to access the map.

## Data Sources

I submitted a FOIL request to HCR and the agency provided the data in .txt files. Despite the data being directly provided
by HCR, there were issues with the data not being complete. As a result, any missing data in the map is due to the incomplete data. 
Additionally, I also used NYC Department of City Planning's Neighborhood Tabulation shapefiles for the neighborhood outlines.

## Usage

People click a red square to see a detailed list of all the MCI items, including how much the landlord
claimed the improvement cost, how much HCR awarded them, when the MCI application was submitted and when it 
was ultimately approved if applicable. 

Secondly, someone can select a neighborhood they live in (divided based on Neighborhood Tabulation Areas)
and receive an overall aggregation of all the MCI data for their area, such as average MCI claim cost,
average MCI award amount, and most common MCI item. 

## Why is this important?

Generally, any data from HCR is difficult to obtain and even more difficult to decipher. My goal was to create a straightforward map
where a tenant could theoretically click their building and easily see all the MCI applications that were applied for in the last 10
years.

The hope is that if policymakers and tenants can see how many MCIs their neighborhoods or buildings have been hit by, it can create a 
sense of urgency to have this policy once and for all removed from New York State law. 

![Screen Shot 2021-04-08 at 12 58 53 PM](https://user-images.githubusercontent.com/73041144/114066877-2fc00200-986a-11eb-96f4-130992d49fd3.png)




