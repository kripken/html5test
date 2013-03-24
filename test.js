
function tryFunc(str) {
  try {
    var f = new Function(str);
    return f();
  } catch(e) {
    return e;
  }
}

print(tryFunc('let x = 10; { let x = 20; } return x*x') == 100);

