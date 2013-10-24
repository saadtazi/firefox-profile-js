var path = require('path');

module.exports = {
  brandNewProfile: {
    expectedZip: 'UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA=='
  },
  emptyProfile: {
    path: path.join(__dirname, 'empty-profile'),
    zipExerpts: ['EMAAAAAAAAAAAAAAAAKAAAAZ', 'WEMAAAAAAgAAAAAAAAAKAAAAAAAAAAAAAAAAAAAAAA', 'AAAADoAAAAAAA==']
  },
  profileWithPngExtension: {
    extensions: [path.join(__dirname, 'extensions/png-extension.xpi')],
    // this is no the same string everytime... just commparing fixed part (the image?)
    zipExerpts: ['Z1mvEsZSZH07MdpKp8lGiCAbby3p4s1iAXJDCDujoXOt+B7s5UMQUxPQHMj8VF2WFvPuluImoy1AC5qP9JvRzbmpp6enhoT1NdUqvtCY2acksNPOC0DkX35ODzQruBobe5Iw2UF39k0z6AJWrmscMyGBvonPx1WAKIRWpscIzw2l/9gCUBpQGrgk6GaMRoq94Sk6SL/qsAYu6zXGQwc4FNY2izxnlVW+C+VUgA1CofCUx8USkrZLN8+dl63x82F1WTTiL6VGV4Q6uPonrS4F1HPVrP1I6rCxt//xOKwhif9bEiZ9CtNR1FWZk5NTY7HFtzr6ijtqsl/60xYXaM3SJJ9BYd5sjdEP/vqzlJKA4lPOn0R0WLD0eI5VjNjbt29/BtDPKzXMHW1td162p/tH6HTQsCOHpY7rdykTtiwVFBZlDZ0zuj+BD9ci7QMs5MPHePuHrFKH7JbxwPpFQcHOnTvBhcJjdxc/cqmpLWj9nXm2TeayS4XYTmtWEPx2wDBvnhZ7/tT8M2eATDOE/tCGeHPiQ1ReLfpOyGYWWie/bPN7+7wevKREFh3dEyH2Dyqk86VtOByRoZtJYcydpI7foNGyKGLSVgjNkqUhdXRuYFQfKOjL5FIPx21+Cir38/lKArbX7h58k3mwVh7mcYwJ1E3hwdPUSByOMQcEUGYNIWyMWcGenvixT94LHdAtZDwO586bP/dAImVc6eXl1swxC8fdy6YCLtn0S7vNubhyk+KQs2cXEak+n9B1nOjiPdym+d8ZYRYsU1RlGUnVWWPIOPNcAEJAC7LOFYkKvG5k/tAKCw29BEChupYsW575WGxDynDRLm1Lne159wBOMR+3DjlGFG9pWzaEHiHgRKth6/BIpWuUUq28xyGHqNTCwmcNcrYl3g2MClygUfnp+CGqlXgnh2ICK7/HQEeKNzYNYpKjozON9++Xh5gy5/6gfddHdj+qUL7pP+wJVc0wUC7h49IhuaL/amMjPa4f0MaYAfLwKLjCoJwwHJwWXhuPcqr1lFTGwxznd6toOJzoeiXIW2wk/n9p8KH80mwLQN6W9w+nLe5DQYH2fa9KYYy7VtMdWhDF5DCVK4vbERwWtoS7HIK6UzNneuWb28KAuy6w3Y/D88b5IGEkCT1pSSiSA0QiERb3IHC4lTc/nyusvAXROodoJuA8H0h6W2KFS0IF0tdp5F7Fl4h8mD804RqFczut9rjpFjKgCTESsGUROk9RLbGyT+mK5EAmKnA4Gu5QwZAy0PbZ7fpOgAV59wszsnsh9k4Jv2rbQoUvM5DJPprbw7/ghRBsH5zZNz82UjXbZwjkGCjX34p49gA78op5pgGHkL15GxwcHKGp6A89YggFaUGJZyvUyHTiVheuXRLXbrlyOe0/RCLx8z3fY6S0353XVqJ6eD1DVnRB0wVXFJNh31j1TU4euCiwJD8lfsG4ao6ZU7mTJFAPk/oPqnW5u+zXVai/siidS7RHQezicIYMxt+R7wddRo2y/mim59KCaGxPRFKGwcpJLeS633CLV+U2MCStXysMjZ4mtDro3vzQTOFtH6wpt0NstTn2d37vix/HswQru13kp1IkY5j25SQ6kRldXM+Y4+DLUpf+Si6z']
  },
  profileWithExtNoNamespace: {
    extensions: [path.join(__dirname, 'extensions/no-namespace.xpi')],
    zipExerpts: ['EMAAAAAAAAAAAAAAAA/AAAA', 'CAAAvwgAAD8AAAAAAAAAAAAAAAAAAAAAAGV4', 'wEAAJYEAAAtAAAAAAAAAAAAAAAAACwJAAB']
  }
};

