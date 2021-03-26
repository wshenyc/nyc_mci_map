# Manhattan MCI Map

This is an interactive map displaying all buildings in Manhattan that had/have a Major Capital Improvements application with 
the New York State Division of Homes and Community Renewal (HCR) anytime from 2010-2020. 

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

Generally, any data from HCR is difficult to obtain and even more difficult to decipher. My goal of creating a simple map,
where a tenant could theoretically click their building and easily see all the MCI applications that were applied in the last 10
years, is an attempt to level the playing field between landlord and tenant. Landlords are able to devote the hundreds of hours
necessary to file a tedious MCI application, as well as the thousands needed to hire an engineer and lawyer, while tenants are 
often not nearly well-equipped to contest their landlord's claims. 

The hope is that if policymakers and tenants can see how many MCIs their neighborhoods or buildings have been hit by, it can create a 
sense of urgency to have this policy once and for all removed from New York State law. 

![Screen Shot 2021-03-26 at 5 50 59 PM](https://user-images.githubusercontent.com/73041144/112696249-d57f7400-8e5b-11eb-92b5-813e39d2fe1c.png)


