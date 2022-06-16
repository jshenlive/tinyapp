
const generateRandomString = () => {
  const len = 6;
  const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

  let result = '';
  for (let i = 0; i < len; i++) {
    result += values[Math.floor(Math.random() * values.length)];
  }
  return result;
}

const getUserByEmail = (email, users) => {
  for (const acc in users) {
    if (users[acc].email === email) {
      return users[acc];
    }
  }
  return false;
}

const urlsForUser = (id, urls) => {
  const userData = {}
  for (const url in urls) {
    if (urls[url].userID === id) {
      userData[url] = urls[url];
    }
  }
  return userData;
}

module.exports= {generateRandomString,getUserByEmail,urlsForUser};