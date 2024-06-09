function generateRandomString(length: number) {
    let str = ''
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      str += possible.charAt(Math.floor(Math.random() * possible.length))
    }
  
    return str
  }

export { generateRandomString }