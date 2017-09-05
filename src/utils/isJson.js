export default function(str) {
  try {
    if (JSON.parse(str)) return true;
  } catch(e) {
    return false;
  }
}
