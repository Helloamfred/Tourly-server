var express = require("express");
let nodemailer = require("nodemailer");

var msql = require("mysql");

var app = express();

app.use(express.json());

// app.use(cors)
var cors = require("cors");

app.use(
  cors({
    origin: "*",
  })
);
// localhost:3306

const connection = msql.createConnection({
  host: "localhost",
  user: "root",
  database: "travel_the_world",
  password: "",
});

// var del = connection._protocol._delegateError;
// connection._protocol._delegateError = function (err, sequence) {
//   if (err.fatal) {
//     console.trace("fatal error: " + err.message);
//   }
//   return del.call(this, err, sequence);
// };

// connect to mysql
connection.connect(function (err) {
  if (err) {
    console.log(err.code);
    console.log(err.fatal);
  }
  console.log("Connected!");
});
function enableConstraints() {
  console.log("Enabling constraints");
  connection.query("SET FOREIGN_KEY_CHECKS = 1", (err, result) => {
    if (err) {
      express.response.status(500).jsonp({
        message: err.message,
      });
    }
  });
}
function disableConstraints() {
  console.log("Disabling constraints");
  connection.query("SET FOREIGN_KEY_CHECKS = 0", (err, result) => {
    if (err) {
      express.response.status(500).jsonp({
        message: err.message,
      });
    }
  });
}

// -------------------------------------login users form----------------------------------------------------------//
// get user login info  from database
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  connection.query(
    "SELECT * FROM users WHERE email=?",
    email,
    (err, result) => {
      if (err) {
        res.status(500).jsonp({ message: err.sqlMessage });
      } else {
        if (result.length > 0) {
          if (result[0].password === password) {
            return res
              .status(200)
              .jsonp({ message: "Login successful!", data: email });
          } else {
            console.log(result);
            return res
              .status(404)
              .jsonp({ message: "Email or password incorrect." });
          }
        } else {
          return res.status(404).jsonp({ message: "User not found" });
        }
      }
    }
  );
});

//-------------------------------------USERS--------------------------------------------------//
// post users to database
app.post("/api/users", (req, res) => {
  const user = req.body;
  console.log(req);
  if (!Object.keys(user).length) {
    return res.status(422).jsonp({
      message: "unprocessable entity",
    });
  }
  connection.query(`INSERT INTO users SET ?`, user, (err, result) => {
    if (err) {
      res.status(500).jsonp({
        message: err.message,
        sqlMessage: err.sqlMessage,
      });
    } else {
      if (result.affectedRows > 0) {
        res.status(201).jsonp({
          message: "user created",
        });
      }
    }
  });
});

// get users from database
app.get("/api/users", (req, res) => {
  connection.query("select * from users", (err, result) => {
    if (err) {
      res.status(500).jsonp({
        message: err.message,
      });
    } else {
      res.send(result);
    }
  });
});

// // get user from database using email
// app.get("/api/users", (req, res) => {
//   connection.query("select * from users", (err, result) => {
//     if (err) {
//       res.status(500).jsonp({
//         message: err.message,
//       });
//     } else {
//       res.send(result);
//     }
//   });
// });

// update users to database
app.put("/api/users", (req, res) => {
  const data = [
    req.body.full_name,

    req.body.password,
    req.body.email,
    req.body.id,
  ];
  disableConstraints();
  connection.query(
    "UPDATE users SET full_name=?, password=?,email=?  WHERE id=?",
    data,
    (err, result) => {
      if (err) {
        res.status(500).jsonp({
          message: err.message,
        });
        enableConstraints();
      } else {
        if (result.affectedRows > 0) {
          res.status(200).jsonp({
            message: "User updated successfully!",
          });
          enableConstraints();
        } else {
          res.status(500).jsonp({
            message: "Something went wrong. User was not found.",
          });
          enableConstraints();
        }
      }
    }
  );
});

// delete user from database
app.delete("/api/users", (req, res) => {
  const { id } = req.body;
  isuserFound(id, res, callback);
  disableConstraints();
  function callback(isFound) {
    if (isFound) {
      const sql = "DELETE FROM users WHERE id=?";
      connection.query(sql, id, (error, result) => {
        if (error) {
          res.status(500).jsonp({
            message: error.message,
            sqlMessage: error.sqlMessage,
          });
          enableConstraints();
        } else {
          res.status(200).jsonp({
            message: "user deleted successfully!",
          });
        }
      });
      enableConstraints();
    } else {
      res.status(404).jsonp({
        message: `user with ID: ${id} is not found!`,
      });
      enableConstraints();
    }
  }
});

function isuserFound(id, res, callback) {
  const sql = "SELECT * FROM users WHERE id=?";

  connection.query(sql, id, (error, result) => {
    if (error) {
      res.status(500).jsonp({
        message: error.message,
        sqlMessage: error.sqlMessage,
      });
    } else {
      if (result.length > 0) {
        callback(true);
      } else {
        callback(false);
      }
    }
  });
}

//------------------------------------------------packages---------------------------------------------//
// post packages to database
app.post("/api/packages", (req, res) => {
  const data = [req.body.package, req.body.description, req.body.price];
  console.log(data);
  connection.query(
    `INSERT INTO packages SET package=?, description=?, price=?`,
    data,
    (err, result) => {
      if (err) {
        res.status(500).jsonp({
          message: err.message,
        });
      } else {
        if (result.affectedRows > 0) {
          res.status(201).jsonp({
            message: "package created",
          });
        }
      }
    }
  );
});

// get packages from database
app.get("/api/packages", (req, res) => {
  connection.query("select * from packages", (err, result) => {
    if (err) {
      res.status(500).jsonp({
        message: err.message,
      });
    } else {
      res.send(result);
    }
  });
});

// update packages to database
app.put("/api/packages", (req, res) => {
  const data = [
    req.body.package,
    req.body.description,
    req.body.price,
    req.body.id,
  ];
  disableConstraints();
  connection.query(
    "UPDATE packages SET package=?,description=?, price=? WHERE id=?",
    data,
    (err, result) => {
      if (err) {
        res.status(500).jsonp({
          message: err.message,
        });
        enableConstraints();
      } else {
        if (result.affectedRows > 0) {
          res.status(200).jsonp({
            message: "package updated successfully!",
          });
          enableConstraints();
        } else {
          res.status(500).jsonp({
            message: "Something went wrong. package was not found.",
          });
          enableConstraints();
        }
      }
    }
  );
});

// delete package from database
app.delete("/api/packages", (req, res) => {
  const { id } = req.body;
  console.log(id);
  ispackageFound(id, res, callback);

  function callback(isFound) {
    if (isFound) {
      disableConstraints();
      const sql = `DELETE FROM packages WHERE id=?;`;

      connection.query(sql, id, (error, result) => {
        if (error) {
          res.status(500).jsonp({
            message: error.message,
            sqlMessage: error.sqlMessage,
          });
          enableConstraints();
        } else {
          res.status(200).jsonp({
            message: "package deleted successfully!",
          });
          enableConstraints();
        }
      });
    } else {
      res.status(404).jsonp({
        message: `package with ID: ${id} is not found!`,
      });
    }
  }
});

// utilities
function ispackageFound(id, res, callback) {
  const sql = "SELECT * FROM packages WHERE id=?";

  connection.query(sql, id, (error, result) => {
    if (error) {
      res.status(500).jsonp({
        message: error.message,
        sqlMessage: error.sqlMessage,
      });
    } else {
      if (result.length > 0) {
        callback(true);
      } else {
        callback(false);
      }
    }
  });
}

//-----------------------------------------------------------------DESTINATIONS-----------------------------------------------------//

// post destination to database
app.post("/api/destinations", (req, res) => {
  const data = req.body;
  console.log(data);
  connection.query("INSERT INTO destinations SET ?", data, (err, result) => {
    if (err) {
      res.status(500).jsonp({
        message: err.message,
      });
    } else {
      if (result.affectedRows > 0) {
        res.status(201).jsonp({
          message: "destination  added",
        });
      }
    }
  });
});

// get destination from database
app.get("/api/destinations", (req, res) => {
  connection.query("select * from destinations", (err, result) => {
    if (err) {
      res.status(500).jsonp({
        message: err.message,
      });
      enableConstraints();
    } else {
      res.send(result);
    }
  });
});

// update destination to database
app.put("/api/destinations", (req, res) => {
  const data = [req.body.destination, req.body.id];
  disableConstraints();
  connection.query(
    "UPDATE destinations SET destination=? WHERE id=?",
    data,
    (err, result) => {
      console.log(result);
      if (err) {
        res.status(500).jsonp({
          message: err.message,
        });
        enableConstraints();
      } else {
        enableConstraints();

        if (result.affectedRows > 0) {
          res.status(200).jsonp({
            message: "destination updated successfully!",
          });
        } else {
          enableConstraints();
          res.status(500).jsonp({
            message: "Something went wrong. destination was not found.",
          });
        }
      }
    }
  );
});

// delete destinations from database
app.delete("/api/destinations", (req, res) => {
  const { id } = req.body;
  getById(id, callback, res);
  function callback(isFound) {
    console.log(isFound);
    isdestinationPresent = isFound;
  }
  if (isdestinationPresent) {
    console.log(`destination with ${id} not found`);
  }
  disableConstraints();
  connection.query(
    "DELETE FROM destinations WHERE id=?",
    req.body.id,
    (err, result) => {
      if (result.affectedRows > 0) {
        res.status(200).jsonp({
          message: "destination deleted successfully!",
        });
        enableConstraints();
      } else {
        res.status(500).jsonp({
          message: "Something went wrong. destination was not deleted.",
        });
        enableConstraints();
      }
    }
  );
});

function getById(id, callback, res) {
  const sql = "SELECT * FROM destinations WHERE id=?";
  connection.query(sql, id, (err, result) => {
    if (err) {
      res.status(500).json({ message: err.message });
    } else {
      if (result.length > 0) {
        callback(true);
      } else {
        callback(false);
      }
    }
  });
}

//------------------------------------------LOCATION--------------------------------------------//
// post locations to database
app.post("/api/locations", (req, res) => {
  const data = [req.body.location, req.body.description];

  connection.query(
    `INSERT INTO locations SET location=?, description=?`,
    data,
    (err, result) => {
      if (err) {
        res.status(500).jsonp({
          message: err.message,
        });
      } else {
        if (result.affectedRows > 0) {
          res.status(201).jsonp({
            message: "location created",
          });
        }
      }
    }
  );
});

// get locations from database
app.get("/api/locations", (req, res) => {
  connection.query("select * from locations", (err, result) => {
    if (err) {
      res.status(500).jsonp({
        message: err.message,
      });
    } else {
      res.send(result);
    }
  });
});

// update locations to database
app.put("/api/locations", (req, res) => {
  const data = [req.body.location, req.body.description, req.body.id];
  disableConstraints();
  connection.query(
    "UPDATE locations SET location=?,description=? WHERE id=?",
    data,
    (err, result) => {
      if (err) {
        res.status(500).jsonp({
          message: err.message,
        });
        enableConstraints();
      } else {
        if (result.affectedRows > 0) {
          res.status(200).jsonp({
            message: "location updated successfully!",
          });
          enableConstraints();
        } else {
          res.status(500).jsonp({
            message: "Something went wrong. location was not found.",
          });
          enableConstraints();
        }
      }
    }
  );
});

// delete location from database
app.delete("/api/locations", (req, res) => {
  const { id } = req.body;
  getById(id, callback, res);
  function callback(isFound) {
    console.log(isFound);
    islocationPresent = isFound;
  }
  if (islocationPresent) {
    console.log(`location with ${id} not found`);
  }
  disableConstraints();
  connection.query(
    "DELETE FROM locations WHERE id=?",
    req.body.id,
    (err, result) => {
      if (result.affectedRows > 0) {
        res.status(200).jsonp({
          message: "location deleted successfully!",
        });
        enableConstraints();
      } else {
        res.status(500).jsonp({
          message: "Something went wrong. location was not deleted.",
        });
        enableConstraints();
      }
    }
  );
});

function getById(id, callback, res) {
  const sql = "SELECT * FROM locations WHERE id=?";
  connection.query(sql, id, (err, result) => {
    if (err) {
      res.status(500).json({ message: err.message });
    } else {
      if (result.length > 0) {
        callback(true);
      } else {
        callback(false);
      }
    }
  });
}

// ---------------------------------------------REQUESTS-----------------------------//

// post request to database
app.post("/api/requests", (req, res) => {
  const data = [
    req.body.user_id,
    req.body.destination_id,
    req.body.travellers,
    req.body.price,
    req.body.location_id,
    req.body.package_id,
  ];
  console.log(data);
  disableConstraints();
  connection.query(
    `INSERT INTO requests SET user_id=?,destination_id=?,travellers=?, price=?,location_id=?, package_id=? `,

    data,
    (err, result) => {
      if (err) {
        res.status(500).jsonp({
          message: err.message,
        });
      } else {
        if (result.affectedRows > 0) {
          res.status(201).jsonp({
            message: "request accepted",
          });
        }
      }
    }
  );
});

// get request from database
app.get("/api/requests", (req, res) => {
  connection.query(
    `SELECT requests.request_id, users.full_name, locations.location,
    destinations.destination,packages.package,travellers,packages.price
    FROM ((((requests
    INNER JOIN users ON requests.user_id = id)
    INNER JOIN locations ON requests.location_id = locations.id)
    INNER JOIN destinations ON requests.destination_id = destinations.id)
    INNER JOIN packages ON requests.package_id = packages.id)
   

    ;`,

    (err, result) => {
      if (err) {
        res.status(500).jsonp({
          message: err.message,
        });
      } else {
        res.send(result);
      }
    }
  );
});

// // get one user's requests
// app.get("/api/userrequest", (req, res) => {
//   const { user_id } = req.body;
//   let isuserPresent;

//   if (!user_id) {
//     res.status(400).jsonp({
//       message: "user_id field is required",
//     });
//     return;
//   }

//   function callback(isFound) {
//     isuserPresent = isFound;
//   }
//   getById(user_id, callback, res);
//   if (!isuserPresent) {
//   }
//   connection.query(
//     `SELECT
//            requests.request_id,
//            users.id AS user_id,
//            users.full_name,  users.address, users.phone, users.email,
//            destinations.id AS destination_id ,destinations.destination,
//            locations.id As location_id,locations.location,locations.description,
//            packages.id AS package_id,packages.package,packages.description
//               FROM requests
//             INNER JOIN users ON requests.user_id=users.id
//             INNER JOIN destinations ON requests.destination_id=destinations.id
//             INNER JOIN locations ON requests.location_id=locations.id
//             INNER JOIN packages ON requests.package_id=packages.id WHERE user_id=?;`,
//     user_id,
//     (err, result) => {
//       if (err) {
//         res.status(500).jsonp({
//           message: err.message,
//         });
//       } else {
//         if (result.length > 0) {
//           res.status(200).jsonp({
//             requests: result,
//           });
//         } else {
//           res.status(404).jsonp({
//             message: `Something went wrong. User with id ${user_id} was not found.`,
//           });
//         }
//       }
//     }
//   );
// });

// function getById(id, callback, res) {
//   const sql = "SELECT * FROM `requests` WHERE user_id=?";
//   connection.query(sql, id, (err, result) => {
//     if (err) {
//       res.status(500).jsonp({ message: err.message });
//     } else {
//       if (result.length > 0) {
//         callback(true);
//       } else {
//         callback(false);
//       }
//     }
//   });
// }

// update request to server
// app.put("/api/requests/:id", (req, res) => {
//   const data = [
//     req.body.users,
//     req.body.destinations,
//     req.body.locations,
//     req.body.packages,
//     req.body.travellers,
//   ];
//   disableConstraints();
//   connection.query(
//     "UPDATE requests SET users=?,destinations=?,locations=?,packeges=?,travellers=?,WHERE id=?",
//     data,
//     (err, result) => {
//       if (err) {
//         res.status(500).jsonp({
//           message: err.message,
//         });
//       } else {
//         enableConstraints();
//         if (result.affectedRows > 0) {
//           res.status(200).jsonp({
//             message: "request updated successfully!",
//           });
//         } else {
//           enableConstraints();
//           res.status(500).jsonp({
//             message: "Something went wrong. request was not found.",
//           });
//         }
//       }
//     }
//   );
// });

// delete request from database

app.delete("/api/requests", (req, res) => {
  const { id } = req.body;
  getById(id, callback, res);
  let isrequestPresent;

  function callback(isFound) {
    console.log(isFound);
    isrequestPresent = isFound;

    console.log(isrequestPresent);
    if (isrequestPresent) {
      disableConstraints();
      connection.query(
        "DELETE FROM requests WHERE request_id=?",
        req.body.id,
        (err, result) => {
          if (result.affectedRows > 0) {
            res.status(200).jsonp({
              message: "request deleted successfully!",
            });
            enableConstraints();
          } else {
            res.status(500).jsonp({
              message: "Something went wrong. request was not deleted.",
            });
            enableConstraints();
          }
        }
      );
    } else {
      res.status(404).jsonp({
        message: `request with ${id} not found`,
      });
    }
  }
});

function getById(id, callback, res) {
  connection.query(
    "SELECT * FROM requests WHERE request_id=?",
    id,
    (err, result) => {
      if (err) {
        res.status(500).json({ message: err.message });
      } else {
        if (result.length > 0) {
          callback(true);
        } else {
          callback(false);
        }
      }
    }
  );
}

// --------------paypal-------------------//
// import "dotenv/config"; // loads variables from .env file
// import * as paypal from "./paypal-api.js";
const { PORT = 8888 } = process.env;

app.use(express.static("public"));

// parse post params sent in body in json format
app.use(express.json());

app.post("/my-server/create-paypal-order", async (req, res) => {
  try {
    const order = await paypal.createOrder();
    res.json(order);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/my-server/capture-paypal-order", async (req, res) => {
  const { orderID } = req.body;
  try {
    const captureData = await paypal.capturePayment(orderID);
    res.json(captureData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// -----------------Mpesa------------------------//
app.get("/api/mpesa", (req, res) => {
  res.send("mpesa programming in progress, time to get paid");
});





// ---------------Emails--------------------//

app.post("/api/emails", async (req, res) => {
  console.log(req.body);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "youngkid638@gmail.com",
      pass: "hqdwpakklvnhvajm",
    },
  });
  try {
    const info = await transporter.sendMail(req.body);
    res.status(200).jsonp(info);
  } catch (error) {
    res.status(500).jsonp(error);
  }
});



// -------------------------SERVER---------------------------------------//
app.listen(3000, function () {
  console.log("App listening on port: 3000");
});
