# SV KASSA - final internship project

store monetary values in cents(integer), so that 1$ will be stored as 100
division will always be completed with rounding to floor if necessary(e.g. 101/2=50)
recordDate for daily record is stored in db in YYYY-MM-DD format, but DTO accepts it as a DD.MM.YYYY and API responds with DD.MM.YYYY as well 
frontend runs on 3001, backend runs on 3000
isntalled `concurrently` to run frontend and backend at the same time
the issue with login when connecting frontend and backend occurred: 
1. cors - easily omitted by sending requests and receiving responses via server part of the next.js, using it as a proxy
2. failed to clear the cookie - after logout, I still could have gone to /dashboard, but now it's fixed but clearing the cookie properly