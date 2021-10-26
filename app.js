// ********* Libraries ************
const express = require("express"); 
const ejs = require("ejs");
const seedRandom = require("seedrandom");
const fs = require("fs");
// ********************************

// ********* Set up App ***********
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
// ********************************



// Get the needed data from the files.
let setup = fs.readFileSync("setup.env", { encoding: 'utf8' });
setup = setupEnv(setup);


// ********* Set up the variables ******************
const participants = setup.participants || ["Person 1", "Person 2", "Person 3"];

// The URL to the server.
const mainURL = setup.mainURL || "127.0.0.1";
const port = setup.port || 8080;

// The path for the master list that holds all of the participants.
const theList = setup.listURL || "TheList";

const seed = setup.seed || 1;
const before = setup.beforeMessage || "The Holidays are here, and ";
const after = setup.afterMessage || " made the nice list. Get them something nice this year!";
// *************************************************


// ********* Process the data **********************
// Set up Random Seed Generator.
const random = seedRandom(seed);

// Mixing the list using the Random Seed Generator.
// A function call that's checked/used twice. (lol) Returns a randomized list to choose from.
const list = naughtyOrNice(participants, random);

// Create the secret santa list.
var whoGotWho = whoGetsWho(list, random);

// Mix this list, so the person sending out the secrets doesn't know too.
whoGotWho = naughtyOrNice(whoGotWho, random);
// *************************************************



// *********** Server Paths *************************

app.listen(port, (err) => {
    console.log("Listening on port " + port);

    if (err){
        console.log("ERROR!");
        console.log(err);
    }
});

// To keep others from finding the list, the user can change the default URL in the setup.env file.
app.get("/" + theList, (req, res) => {

    // Render a web page that outputs a list of the participants and their unique url that they get.
    res.render("from", {
        list: whoGotWho,
        url: mainURL + ":" + port + "/sercetSanta/"
    });

});


// Dynamic path to who they got.
app.get("/sercetSanta/:ID", (req, res) => {

    // Match the ID to the participants.
    let ID = parseInt(req.params.ID);
    let holder;

    holder = whoGotWho.findIndex((who) => {
        return who.ID === ID;
    });

    if (holder > -1){

        res.render("to", {
            before: before,
            after: after,
            to: whoGotWho[holder].to
        });

    }else {

        res.redirect("/404");

    }

});


// 404 Path
app.get("/404", (req, res) => {
    res.render("404", {});
});

// The method that's used to catch all incorrect paths.
app.use(function (req, res, next) {
    
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        // res.render('404', {});
        res.redirect("/404");
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');

});






// ******************* Functions ********************

/**
 * naughtyOrNice:
 * A function that randomly mixes up the list of participants.
 * 
 * @function naughtyOrNice
 * @param {array}     [participants] an array that contains the participants.
 * @param {function}  [random]       a function that outputs random numbers.
 * @returns {array}                  an array of mixed up strings.
 * 
*/
function naughtyOrNice(participants, random){

    let min = 0;
    let max = participants.length - 1;
    let holder;

    // Loop through the participants and mix up their position in the array.
    for(let i = 0; i <= 50000; i++){
        let personToMove = randomIntFromInterval(min, max, random);
        let movePersonTo = randomIntFromInterval(min, max + 1, random);

        holder = participants.splice(personToMove, 1)[0];
        participants.splice(movePersonTo, 0, holder);
    }

    return participants; // Return the mixed list. 
}



// Take the array of participants and asign them a person to get a gift for, and 
// create a unique URL for them to check who they got.
/**
 * whoGetsWho:
 * A function that returns an array full of objects.
 * Each object contains the participant, who they're getting a gift for, and the ID
 * that will be used to create their unique URL. By having each participant linked to 
 * the next, this eliminates the need to check if someone got themselves, one person 
 * getting chosen more than once, and keep participants from being left out (which can
 * happen when there are an odd number of participants). 
 * 
 * @function whoGetsWho
 * @param {array}     [participants] an array that contains the participants.
 * @param {function}  [random]       a function that outputs random numbers.
 * @returns {array}                  an array full of objects containing the names of
 *                                   the person getting a gift, who is getting it, and
 *                                   the ID that is used to make the URL.
 * 
*/
function whoGetsWho(participants, random){
    let returner = [];

    for (let i = 0; i < participants.length; i++){
        

        // TODO Need to check if user ID is unique.

        // Check if i is at the end of the list. Link the last 
        // person to the first person on the list.
        if (i + 1 == participants.length){

            returner.push({
                    from: participants[i],
                    to: participants[0],
                    ID: randomIntFromInterval(10, 99999999, random)
                });

        }else {

            returner.push({
                from: participants[i],
                to: participants[i + 1],
                ID: randomIntFromInterval(10, 99999999, random)
            });

        }
    }
    
    return returner; 
}


// 

/**
 * randomIntFromInterval:
 * A function that returns a random integer between the min and max. 
 * Code from https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
 * 
 * @function randomIntFromInterval
 * @param {Number}   [min]     the minimum number that is wanted.
 * @param {Number}   [max]     the maximum number that is wanted.
 * @param {function} [random]  a function that outputs random numbers.
 * @returns {Number}           the integer that was created.
 * 
*/
function randomIntFromInterval(min, max, random) { 
    return Math.floor(random() * (max - min + 1) + min);
}


/**
 * setupEnv:
 * A function that parses the needed data from the passed string.
 * 
 * @function setupEnv
 * @param {String}   [setup]  a string containing info from the loaded file.
 * @returns {Object}          an object full of the parsed data.
 * 
*/
function setupEnv(setup){

    setup = setup.split(/\n/);
    setup = setup.filter(str => {
        return str != '';
    });
        
    let seed;
    let mainURL;
    let port;
    let listURL;
    let found = false; 
    let beforeMessage;
    let afterMessage;
    let participants = [];


    // TODO Shorten this. Use another for loop with an array that holds the searched 
    //      for info and another array that holds the data that it found.

    // Seed
    setup.forEach(str => {
        
        if(found && str.indexOf("#") != -1) {

            found = false;

        }else if (found){

            seed = parseInt(str);
            found = false;

        }else if(str.indexOf("Seed") != -1) {
            found = true;
        }
    });

    // Main URL for the site.
    setup.forEach(str => {
        
        if(found && str.indexOf("#") != -1) {

            found = false;

        }else if (found){

            mainURL = str;
            found = false;

        }else if(str.indexOf("Main URL") != -1) {
            found = true;
        }
    });

    // Port
    setup.forEach(str => {
        
        if(found && str.indexOf("#") != -1) {

            found = false;

        }else if (found){

            port = parseInt(str);
            found = false;

        }else if(str.indexOf("Port") != -1) {
            found = true;
        }
    });

    // The path for the main List.
    setup.forEach(str => {
        
        if(found && str.indexOf("#") != -1) {

            found = false;

        }else if (found){

            listURL = str;
            found = false;

        }else if(str.indexOf("the List") != -1) {
            found = true;
        }
    });

    // The Before message.
    setup.forEach(str => {
        
        if(found && str.indexOf("#") != -1) {

            found = false;

        }else if (found){

            beforeMessage = str;
            found = false;

        }else if(str.indexOf("Before") != -1) {
            found = true;
        }
    });

    // The After message.
    setup.forEach(str => {
        
        if(found && str.indexOf("#") != -1) {

            found = false;

        }else if (found){

            afterMessage = str;
            found = false;

        }else if(str.indexOf("After") != -1) {
            found = true;
        }
    });

    // The list of participants.
    setup.forEach(str => {
        
        if (found){

            participants.push(str);

        }else if(str.indexOf("Participants") != -1) {
            found = true;
        }
    });

    return {
        seed,
        mainURL,
        port,
        listURL,
        beforeMessage,
        afterMessage,
        participants
    }
}