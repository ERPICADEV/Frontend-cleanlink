Teams Intro : 

“An Idea here can be introducing teams in our app which will increase gamification and makes it easier to make areas… A team should at least have 3 users and they have to report trash such that every report joined makes a closed figure on the map and that figure will be classified as an area and that area will have name of their team on it.

1. Now Its just a rough idea and there will be many possibilities to consider.. For example: Overlapping of areas, and there is also a possibility that 3 people in a team.. One in USA.. One in China.. One in antarctica reports trash and make the whole earth their area.
2. First there can be a maximum of 100m of distance between 2 reports so to enclose an square shaped area with side 1000m they have to make 10 reports on each side so they can make it their area.
3. Second if two area overlap, the one team with credit score + no. of legit reports gets the overlapping part.
4. Working as a team will give extra 0.25x credit score to the member who reports something and 0.05x credits to every member of the team even if they are just coexisting there,  but there is one condition that the report should be in your dedicated area.
5. We can rank that area’s civic score so much easier than before now.. as we got an actual area and the mcd and other organization can decide which area has to be focused more.”

So the first task for me is to remove my handicap so i can code in django as i am not familiar with node.js so i made decision to make django as a seperate service which will not change node as core app and we can add teams logic without any interference.

![Screenshot 2026-01-21 231826.png](attachment:8005e2cc-863e-4fa2-a42f-2c05b9922523:Screenshot_2026-01-21_231826.png)

*Note:  the data like <username> is not actually included in url but it will be give by node as json in post request and django will return a response

Above I wrote down the roles of every component giving full control of teams to django without removing node.js as core app.

Now I have a full plan and guide to team crud operations but there is still main problem left.. which is assigning virtual areas on map using minimal resources…

## Virtual Areas

1. First of all the area should be a circle a rough circle covering most of the team reports.
2. Circle also makes it easier that we just need center point and radius and boom circle is done.
3. And now the problem arrives.. “How will i even do this”… so i did some research about latitudes and longitudes and simply they are just distance from equator and prime meridian respectively.. we can’t state that but in my condition where all the latitudes are in north and all the longitudes in east for India, its a sweet spot for us.
4. But again the problem is i can’t stat latitudes and longitudes as distances and now my plan is failed but…
5. I got introduced to 2 things, convex hull and harvesine formula and that’s it now all the pieces are there now i just have to do it.

![Screenshot 2026-01-24 145453.png](attachment:bc16a82c-8890-4075-b275-7fb138146195:Screenshot_2026-01-24_145453.png)

## Actual Workflow

Node work:

Node should create a table in database which should have 2 fields, 1) team_id 2) area_boundary(json)

1. x1 = create Team endpoint url
    1. On x1 node should send post request with some data with format {”name”:teamName , “leader”, username}
    2. Then the team will be created and fjango willl pass team_id which node should store to for further team functions.
2. On delete team endpoint, Node should send team_id as request and will get success response or error response
3. On add member endpoint, Node should send new members usernames in an array ‘username’ and team_id
4. On delete member endpoint, Node should send member’s username.
5. Now that the teams crud are made, next we have to get some call when i a report is resolved and then further calculation will be done in django.
    1. Now there is a 5th endpoint where node sends data on successful report.
    2. Data ⇒ reporter username ’reporter’, latitude of report ‘latitudes’, longitude of report ‘longitudes’

![Screenshot 2026-01-24 194040.png](attachment:2b7614d6-0cc2-4cbc-88af-5eb8f0733af0:Screenshot_2026-01-24_194040.png)