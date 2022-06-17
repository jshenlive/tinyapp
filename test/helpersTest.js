const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    return assert(user, expectedUserID);
  });

  it('should return undefined with invalid email', function() {
    const user = getUserByEmail("abcd", testUsers);
    return assert.isUndefined(user);
  });

  it('should return false when used in condition with invalid email', function() {
    let user = getUserByEmail("abcd", testUsers);
    if (!user) {
      user = false;
    }
    return assert.isFalse(user);
  });

  it('should return undefined with empty email', function() {
    let user = getUserByEmail("", testUsers);
    return assert.isUndefined(user);
  });

  it('should return false when used in condition with empty email', function() {
    let user = getUserByEmail("", testUsers);
    if (!user) {
      user = false;
    }
    return assert.isFalse(user);
  });
});