const express = require('express')
const graphQLHTTP = require('express-graphql')
const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLSchema
} = require('graphql')

const datas = [{
    firstname: 'Vincent',
    lastname: 'Cordobes',
    email: 'vincent.cordobes@toto.fr'
  }, {
    firstname: 'Jane',
    lastname: 'Doe',
    email: 'jane.doe@mail.com'
}]

const UserType = new GraphQLObjectType({
  name: 'User_Type',
  description: 'define a user',
  fields: () => ({
    firstname: {
      type: GraphQLString,
      description: 'prénom utilisateur'
    },
    lastname: {
      type: GraphQLString,
      description: 'nom utilisateur'
    },
    email: {
      type: GraphQLString,
      description: 'Email utilisateur'
    }
  })
})

const QueriesFields = {
  getUsers: {
    type: new GraphQLList(UserType),
    resolve: () => {
      return datas
    }
  },
  getUser: {
    type: UserType,
    args: {
      email: {
        type: GraphQLString
      },
    },
    resolve: (_, {email}) => {
      return datas.find(user => email === user.email)
    }
  }
}

const query = new GraphQLObjectType({
  name: 'Query_Type',
  description: 'Query type',
  fields: () => ({
    getUsers: QueriesFields.getUsers,
    getUser: QueriesFields.getUser
  })
})

const UserInput = new GraphQLInputObjectType({
  name: 'User_Input',
  description: 'Fields to do a user',
  fields: () => ({
    firstname: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'User firstname'
    },
    lastname: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'User lastname'
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'User email'
    }
  })
})

const MutationsFields = {
  addUser: {
    type: UserType,
    description: 'add a user in database',
    args: {
      user: {
        type: UserInput
      }
    },
    resolve: (_, {user}) => {
      datas.push(user)
      return user
    }
  }
}

const mutation = new GraphQLObjectType({
  name: 'Mutation_Type',
  description: 'Mutation type',
  fields: () => ({
    addUser: MutationsFields.addUser,
  })
})

const schema = new GraphQLSchema({
  query,
  mutation
})

const app = express()
const PORT = 8083

app.use('/', graphQLHTTP({
  schema: schema,
  graphiql: true,
  pretty: true,
  formatError: error => ({
    message: error.message,
    locations: error.locations,
    stack: error.stack
  })
}))

app.listen(PORT, () => {
  console.log(`Server running on port %s`, PORT)
})


/*
POST http://localhost:8083
Header:
Content-Type:application/json
****************************
Body:
****************************
{
  "query": "query getUserByMail ($email: String) { customer: getUser (email:$email) { firstname lastname email } }",
  "operationName": "getUserByMail",
  "variables": { "email": "john.doe@mail.com" }
}
****************************
{
  "query": "query getAllUsers { users: getUsers { firstname lastname email } }",
  "operationName": "getAllUsers"
}
****************************
{
  "query": "mutation addNewUser { addUser(user: { firstname: \"jean\", lastname: \"dupont\", email: \"jean.dupont@mail.com\" }) { firstname lastname email } }",
  "operationName": "addNewUser"
}
*/
