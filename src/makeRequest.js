export default function makeRequest(val) {
  return new Promise((resolve, reject) => {
    let _url = 'http://localhost:3000/states?q=' + val;
    fetch(_url).then((resp) => resolve(resp.json()));
  });
}
