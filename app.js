const express = require('express');
const app = express();

require('./startup/prod')(app);



const PORT = process.env.PORT || 3050;

const Joi = require('joi');

const spell = require('spell-checker-js'); 
const { scrabbleScore } = require('./dictionary');
// Load dictionary
spell.load('en');

app.get('/', (req, res) => {
    res.send('😄');
});

// Example of API call:
// http://localhost:5000/api/scrabbleScore?word=hello
app.get('/api/scrabbleScore/', (req,res) =>{    
    // retrieve word from query
    const {word} = req.query;

    // validate input with Joi
    const input = { word: word };
    const schema = Joi.object({ word: Joi.string().min(3).max(10).regex(/^[a-zA-Z]+$/).required() });
    const result = schema.validate(input);
    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }
    
    // spell check
    const isEnglishWord = spell.check(word).length === 0; // 0 = word spelled correctly
    if(!isEnglishWord)  {
        res.status(404).send("word not found in dictionary");
        return;
    }
    
    // respond with scrabble score
    const score = scrabbleScore(word);
    const response = { "value": score };
    res.send(JSON.stringify(response));
});

app.listen(PORT, ()=> {
console.log(`Listening on ${PORT}...`);
});
