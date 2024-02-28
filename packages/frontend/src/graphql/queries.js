const helpListHelps = `
  query HelpListHelps {
    listHelps {
      items {
        id
        title
        content
      }
    }
  }
`;

module.exports = {
  helpListHelps,
  // other queries...
};