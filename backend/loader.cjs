// This file is a "Bridge" to let cPanel start your ES Module server
// cPanel tries to "require()" files, but your server uses "import".
// This file translates between them.

import('./server.js');
