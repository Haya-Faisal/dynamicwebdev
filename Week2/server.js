// let express = require('express')

// // create an http server that responds to http requests
// let app = express()

// // have our server respond to get requests with appropriate file from public folder
// app.use(express.static('public'))

// // tell our express app to process incoming request bodies
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

// // 'ejs' view engine
// app.set('view-engine', 'ejs');

// // Array to store dessert searches
// let dessertSearches = []

// // POST request handler for dessert form
// app.post('/generate', myDessertRequestHandler)

// function myDessertRequestHandler(req, res){
//     let country = req.body.country
//     let craving = req.body.craving
    
//     console.log('Got dessert request - Country: ' + country + ', Craving: ' + craving)

//     // Store in array
//     dessertSearches.push({ country: country, craving: craving, date: new Date() })

//     // Send simple response
//     res.send('Thank you for your dessert search! Country: ' + country + ', Craving: ' + craving)
// }

// // // GET request handler to view all past searches
// app.get('/searches', myGetSearchesRequestHandler)

// function myGetSearchesRequestHandler(req, res){
//     let searchesText = "Past Dessert Searches:\n\n"
    
//     if (dessertSearches.length === 0) {
//         searchesText += "No searches yet!"
//     } else {
//         for (let i = 0; i < dessertSearches.length; i++){
//             searchesText += dessertSearches[i].country + " - " + dessertSearches[i].craving + " (" + dessertSearches[i].date.toLocaleString() + ")\n"
//         }
//     }
    
//     res.send(searchesText)
// }

// app.listen(3000)

const express = require('express')
const path = require('path')

// create an http server that responds to http requests
let app = express()

// Set up EJS view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// have our server respond to get requests with appropriate file from public folder
app.use(express.static('public'))

// tell our express app to process incoming request bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Array to store dessert searches
let dessertSearches = []

// Route to render the main page with dynamic data
app.get('/', (req, res) => {
    res.render('index', {
        // Dynamic data passed to the template
        pageTitle: 'Dessert Generator',
        welcomeMessage: 'Find Your Perfect Dessert',
        totalSearches: dessertSearches.length,
        featuredDessert: 'Chocolate Croissant'
    })
})

// POST request handler for dessert form - NOW RENDERS EJS TEMPLATE
app.post('/generate', myDessertRequestHandler)

function myDessertRequestHandler(req, res){
    let country = req.body.country
    let craving = req.body.craving
    
    console.log('Got dessert request - Country: ' + country + ', Craving: ' + craving)

    // Store in array
    dessertSearches.push({ country: country, craving: craving, date: new Date() })

    // Render a dynamic response using EJS
    res.render('results', {
        country: country,
        craving: craving,
        searchCount: dessertSearches.length,
        recommendation: getDessertRecommendation(country, craving)
    })
}

// Helper function to generate dynamic dessert recommendations
function getDessertRecommendation(country, craving) {
    const recommendations = {
        'france': {
            'chocolate': 'Chocolate Éclair',
            'fruity': 'Tarte Tatin',
            'creamy': 'Crème Brûlée'
        },
        'italy': {
            'chocolate': 'Tiramisu',
            'fruity': 'Panna Cotta with Berry Compote',
            'creamy': 'Gelato'
        },
        'japan': {
            'chocolate': 'Matcha Chocolate Mochi',
            'fruity': 'Sakura Mochi',
            'creamy': 'Matcha Tiramisu'
        }
    }
    
    const countryLower = country.toLowerCase();
    const cravingLower = craving.toLowerCase();
    
    return recommendations[countryLower]?.[cravingLower] || 'Special Local Dessert';
}

// GET request handler to view all past searches with EJS template
app.get('/searches', myGetSearchesRequestHandler)

function myGetSearchesRequestHandler(req, res){
    res.render('searches', {
        searches: dessertSearches,
        totalCount: dessertSearches.length,
        lastUpdated: new Date().toLocaleString()
    })
}

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000')
})