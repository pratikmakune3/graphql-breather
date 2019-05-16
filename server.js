const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema/schema');

const app = express();

// If the request comes to the route /graphql -> express sends the request to graphql server using ->
app.use('/graphql', expressGraphQL({
    schema,
    graphiql : true
}))

app.listen(4000, () => {
   console.log('Listening');
});