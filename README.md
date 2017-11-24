# gatsby-source-twitch

A [gatsby](https://www.gatsbyjs.org/) source plugin for fetching all the videos and channel info for a Twitch user ID.

Learn more about Gatsby plugins and how to use them here: https://www.gatsbyjs.org/docs/plugins/

## Install

`npm install --save gatsby-source-twitch`


## gatsby-config.js

```javascript
plugins: [
  {
    resolve: `gatsby-source-twitch`,
    options: {
      userID: '<<Twitch UserID eg. 6058227 >>',
      clientID: '<< Add your Twitch client_id here>>'
    },
  },
  ...
]
```

## Examples of how to query:

Get all the videos:

```graphql
{
  allTwitchvideo {
    edges {
      node {
        title
        url
        type
      }
    }
  }
}
```

Get the user/channel info:

```graphql
{
  twitchuser {
    display_name
    description
    profile_image_url
  }
}
```
