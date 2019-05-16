/*
    The idea of Schema file - Instruct GraphQL what kind of data our application is having
    We can introduce the idea of Objects using GraphQLObjectType, look at the CompanyType, UserType etc.
*/

const graphql = require('graphql');
const axios = require('axios');
const {
    /*
        GraphQLObjectType - Used to instruct GraphQL the idea of the object in our application - e.g. User Object
    */
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
   name : 'Company',

    /*
        Making fields as arrow function due to the circular reference - closure
        It's GraphQL's work-around to solve the problem of circular reference !!!
    */
   fields : () => ({
       id : { type : GraphQLString },
       name : { type : GraphQLString },
       description : { type : GraphQLString },
       users: {
           type: new GraphQLList(UserType),
           resolve(parentValue, args) {
               return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                   .then(resp => resp.data);
           }
       }
   })
});

const UserType = new GraphQLObjectType({

   // 2 required properties - name and fields

   // Generally, name = 'User' is the first part of "User"Type
   name : 'User',

    /*
        fields - tells graphql what are all the fields User object has

        Making fields as arrow function due to the circular reference - closure
        It's GraphQL's work-around to solve the problem of circular reference !!!
    */
   fields : () => ({

       /*
            Notice the type inside the object as a value of every key - Type checking !
       */

       id : { type : GraphQLString },
       firstName : { type : GraphQLString },
       age : { type : GraphQLInt },
       company : {
           type : CompanyType,
           resolve(parentValue, args) {
               return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                        then(res => res.data);
           }
       }
   })
});

/*
 You can ask me a Root Query about user in the app, if you give me id of user in args,
 I'll return a type = User back to you
 args - specify the arguments required for a RootQuery to return a User, it'll be given while querying data
*/
const RootQuery  = new GraphQLObjectType({
    name : 'RootQueryType',
    fields : {
        user : {
            type : UserType,
            args : { id : { type : GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then( resp => resp.data );
            }
        },
        company : {
            type : CompanyType,
            args : { id : { type : GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then( resp => resp.data );
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name : 'Mutation',
    fields : {
        addUser : {
            type : UserType,
            args : {
                /*
                    GraphQLNonNull - Required not null property while performing the mutation
                */
                firstName: { type : new GraphQLNonNull(GraphQLString) },
                age: { type : new GraphQLNonNull(GraphQLString) },
                companyId: { type : GraphQLString }
            },
            /*
                In Mutation, resolve function - where actual database operation is performed
            */
            resolve(parentValue, { firstName, age }) {
                return axios.post(`http://localhost:3000/users`, { firstName, age })
                    .then(res => res.data );
            }
        }
    }
});

/*
    Merge RootQuery + UserType --> GraphQL Schema Object  --pass--> GraphQL Middleware inside server.js
    Import GraphQLSchema
*/
module.exports = new GraphQLSchema({
    query : RootQuery,
    mutation
})