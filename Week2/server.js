let express = require('express')

// create an http server that responds to http requests
let app = express()

// have our server respond to get requests with appropriate file from public folder
app.use(express.static('public'))

// tell our express app to process incoming request bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Array to store dessert searches
let dessertSearches = []

// POST request handler for dessert form
app.post('/generate', myDessertRequestHandler)

function myDessertRequestHandler(req, res){
    let country = req.body.country
    let craving = req.body.craving
    
    console.log('Got dessert request - Country: ' + country + ', Craving: ' + craving)

    // Store in array
    dessertSearches.push({ country: country, craving: craving, date: new Date() })

    // Send simple response
    res.send('Thank you for your dessert search! Country: ' + country + ', Craving: ' + craving)
}

// // GET request handler to view all past searches
app.get('/searches', myGetSearchesRequestHandler)

function myGetSearchesRequestHandler(req, res){
    let searchesText = "Past Dessert Searches:\n\n"
    
    if (dessertSearches.length === 0) {
        searchesText += "No searches yet!"
    } else {
        for (let i = 0; i < dessertSearches.length; i++){
            searchesText += dessertSearches[i].country + " - " + dessertSearches[i].craving + " (" + dessertSearches[i].date.toLocaleString() + ")\n"
        }
    }
    
    res.send(searchesText)
}

app.listen(3000)