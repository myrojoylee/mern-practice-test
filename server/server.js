require('dotenv').config();
const path = require('path');
const express = require('express');
const db = require('./db/connection');

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs, resolvers } = require('./schemas');
// const { contextTokenizer } = require('./utils/auth');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3033;
const server = new ApolloServer({
    typeDefs,
    resolvers
})

const startApolloServer = async() => {
    await server.start();

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use('/graphql', expressMiddleware(server, {
        context: authMiddleware
    }));

    if(process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../client/dist')));

        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../client/dist/index.html'))
        })
    }

    db.once('open', () => {
        app.listen(PORT, () => {
            console.log(`API server running on port ${PORT}!`)
        })
    })
}

startApolloServer();