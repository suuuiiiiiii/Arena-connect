var express = require("express");
var fileuploader = require("express-fileupload");
var cloudinary = require("cloudinary").v2;
var mysql2 = require("mysql2");
var app = express();//app() returns an Object:app
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use('/uploads', express.static(__dirname + '/public/uploads'));



const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyA_r1142gYGKzQiRonQxHpTdGsGPfvIoWE");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


app.use(fileuploader());
let dbConfig = "mysql://avnadmin:AVNS_lEbHTP0NcSlHyKW1aIO@mysql-2eb36533-thapar-4da4.i.aivencloud.com:28547/defaultdb";
app.use(express.json());
let mySqlVen = mysql2.createConnection(dbConfig);
mySqlVen.connect(function (errKuch) {
  if (errKuch == null)
    console.log("AiVen Connected Successfulllyyy!!!!");
  else
    console.log(errKuch.message)
})


app.listen(2012, function () {
  console.log("Server Started at Port no: 2004")
})
app.use(express.static("public"));


app.get("/", function (req, resp) {
  console.log(__dirname);
  console.log(__filename);
  let path = __dirname + "/public/index.html";
  resp.sendFile(path);

})
cloudinary.config({
  cloud_name: 'dmj6purmj',
  api_key: '939263932365255',
  api_secret: 'dSOgRwfzgQJPMFuL_AFo_19id_Y'

});
app.post("/signup-server-safe", function (req, resp) {
  let email = req.body.txtemail;
  let pwd = req.body.txtpwd;
  let usertype = req.body.txtusertype;
  mySqlVen.query("SELECT * FROM users2026 WHERE emailid = ?", [email], function (err, result) {
    if (err) {
      resp.send("Db error: " + err.message);
    } else if (result.length > 0) {
      resp.send("This email is already registered.");
    } else {
      mySqlVen.query("INSERT INTO users2026 (emailid, pwd, usertype) VALUES (?, ?, ?)", [email, pwd, usertype], function (err2, result2) {
        if (err2) {
          resp.send("Insert failed: " + err2.message);
        } else {
          resp.send("Signup successful.");
        }

      });
    } 
  });



}); 






app.post("/do-login", (req, resp) => {

  email = req.body.txtemail;
  pwd = req.body.txtpwd;
  if (!email || !pwd) {
    resp.send("Email and password required");
    return;
  }

  const query = "SELECT * FROM users2026 WHERE emailid = ? AND pwd = ?";
  mySqlVen.query(query, [email, pwd], function (errkuch, result) {
    if (errkuch) {
      resp.send("Error: " + err.message);
    } else {
      if (result.length === 1) {
        const user = result[0];
        if (user.usertype === "organizer") {
          resp.send("org"); // Organizer
        } else if (user.usertype === "player") {
          resp.send("player"); // Player
        } 
        else if (user.usertype === "admin") {
          resp.send("admin"); }
        else {
          resp.send("valid"); // Any other type, fallback
        }
      } else {
        resp.send("invalid"); // Wrong email or password
      }
    }
  });
});
  //org details and events fetching
app.post("/save-org-details", async (req, resp) => {

  let picurl = "";
  if (req.files != null) {
    let fName = req.files.pic.name;
    let fullPath = __dirname + "/public/uploads/" + fName;
    req.files.pic.mv(fullPath);

    let picUrlResult = await cloudinary.uploader.upload(fullPath);
    picurl = picUrlResult.url;

  }
  else
    picurl = "nopic.jpg";


  let emailid = req.body.emailid;
  let orgname = req.body.orgname;
  let regnumber = req.body.regnumber;
  let sports = req.body.sports;
  let city = req.body.city;
  let address = req.body.address;
  let website = req.body.website;
  let insta = req.body.insta;
  let head = req.body.head;
  let contact = req.body.contact;

  mySqlVen.query("SELECT * FROM organizers WHERE emailid = ?", [emailid], function (err, result) {
    if (err) {
      resp.send("Database error: " + err.message);
    } else if (result.length > 0) {
      resp.send("This email is already registered.");
    } else {

      let query = `INSERT INTO organizers (emailid, orgname, regnumber, address, city,
  sports, website, insta, head, contact, picurl, dt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)`;

      let values = [emailid, orgname, regnumber, address, city,
        sports, website, insta, head, contact, picurl];
      mySqlVen.query(query, values, (errKuch, result) => {
        if (errKuch == null) {
          resp.send(`
        <html>
       <body>
     <script>
        alert("Record saved successfully!");
      window.location.href = "org-dash.html"; 
    </script>
          </body>
      </html>

`);
        }
        else
          resp.send(errKuch)
      });
    }

  });
});
  app.post("/update-user", async function (req, resp) {
    let emailid = req.body.emailid;
    let picurl = "";

    if (req.files?.pic?.name) {
      let filePath = __dirname + "/public/uploads/" + req.files.pic.name;
      req.files.pic.mv(filePath);
      let result = await cloudinary.uploader.upload(filePath);
      picurl = result.url;
    }

    let updates = [];
    let values = [];

    function addField(field, value) {
      if (value) {
        updates.push(`${field} = ?`);
        values.push(value);
      }
    }

    addField("orgname", req.body.orgname);
    addField("regnumber", req.body.regnumber);
    addField("address", req.body.address);
    addField("city", req.body.city);
    addField("sports", req.body.sports);
    addField("website", req.body.website);
    addField("insta", req.body.insta);
    addField("head", req.body.head);
    addField("contact", req.body.contact);
    if (picurl) addField("picurl", picurl);

    if (updates.length === 0) return resp.send("No fields to update.");

    let query = `UPDATE organizers SET ${updates.join(", ")} WHERE emailid = ?`;
    values.push(emailid);

    mySqlVen.query(query, values, function (err, result) {
      if (!err) {
        if (result.affectedRows === 1) {
          resp.send(`<script>alert("Modified successfully!"); location.href="org-dash.html";</script>`);
        } else {
          resp.send("Invalid email ID");
        }
      } else {
        resp.send(err.message);
      }
    });
  });
  app.get("/fetch-organizer", function (req, resP) {
    const email = req.query.emailid;

    mySqlVen.query("SELECT * FROM organizers WHERE emailid = ?", [email], function (errKuch, result) {
      if (errKuch == null) {
        if (result.length === 0) {
          resP.send(`
          <html>
            <body>
              <script>
                alert("No record found for this Email ID.");
                window.location.href = "org-details.html";
              </script>
            </body>
          </html>
        `);
        } else {
          resP.send(result[0]);
        }
      } else {
        resP.send(`
        <html>
          <body>
            <script>
              alert("Error: ${errKuch.message.replace(/"/g, '\\"')}");
              window.location.href = "org-details.html";
            </script>
          </body>
        </html>
      `);
      }
    });
  });
 app.post("/publish-event", async (req, resp) => {
    let posterurl = "";

    if (req.files != null) {
      let fName = req.files.poster.name;
      let fullPath = __dirname + "/public/uploads/" + fName;
      req.files.poster.mv(fullPath);

      let posterResult = await cloudinary.uploader.upload(fullPath);
      posterurl = posterResult.url;
    } else {
      posterurl = "noposter.jpg";
    }

    let emailid = req.body.emailid;
    let mobile = req.body.mobile;
    let event_name = req.body.event_name;
    let city = req.body.city;
    let venue = req.body.venue;
    let start_date = req.body.start_date;
    let end_date = req.body.end_date;
    let min_age = req.body.min_age;
    let max_age = req.body.max_age;
    let category = req.body.category;
    let fees = req.body.fees;
    let description = req.body.description;

    let query = `INSERT INTO events 
  (emailid, mobile, event_name, city, venue, start_date, end_date,
  min_age, max_age, category, fees, description, poster_url, dt, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)`;

    let values = [emailid, mobile, event_name, city, venue, start_date, end_date, min_age, max_age, category, fees, description, posterurl];

    mySqlVen.query(query, values, (errKuch, result) => {
      if (errKuch == null) {
        resp.send(`
        <html>
          <body>
            <script>
              alert("Event published successfully!");
              window.location.href = "org-dash.html";
            </script>
          </body>
        </html>
      `);
      } else {
        resp.send(errKuch);
      }
    });
  });
app.get("/fetch-events", function (req, res) {
  let emailid = req.query.emailid;
  console.log(emailid)
  let query = "SELECT * FROM events WHERE emailid=?";
  mySqlVen.query(query, [emailid], function (err, result) {
    if (err) {
      res.send("Error in fetching: " + err);
    } else {
      res.send(result); // Send array of rows
    }
  });
});
app.get("/delete-event", function (req, resp) {
  console.log(req.query);

  let event_id = req.query.event_id;

  mySqlVen.query("DELETE FROM events WHERE id = ?", [event_id], function (err, result) {
    if (err == null) {
      if (result.affectedRows == 1)
        resp.send("Event with ID " + event_id + " deleted successfully!");
      else
        resp.send("Invalid Event ID");
    } else {
      resp.send(err);
    }
  });
});


//players details save
async function RajeshBansalKaChirag(imgurl)
{
const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."   
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())
            
            const cleaned = result.response.text().replace(/```json|```/g, '').trim();
            const jsonData = JSON.parse(cleaned);
            console.log(jsonData);

    return jsonData

}
app.post("/save-player-details", async (req, resp) => {
  let acardurl = "nopic.jpg";
  let profileurl = "nopic.jpg";
  let jsondata = { name: "", dob: "", gender: "" };

  if (req.files) {
    if (req.files.acard) {
      let acardPath = __dirname + "/public/uploads/" + req.files.acard.name;
      await req.files.acard.mv(acardPath);
      let acardResult = await cloudinary.uploader.upload(acardPath);
      acardurl = acardResult.secure_url;

      try {
        
        jsondata = await RajeshBansalKaChirag(acardurl);
        console.log("Extracted Aadhaar Info:", jsondata);
        if (jsondata.dob && jsondata.dob.includes("/")) {
const [dd, mm, yyyy] = jsondata.dob.split("/");
jsondata.dob = `${yyyy}-${mm}-${dd}`;
console.log("Formatted DOB:", jsondata.dob);
}
      } catch (e) {
        console.log("AI Aadhaar Extraction Error:", e.message);
        resp.send("Could not extract Aadhaar details. Please try with a clearer image.");
        return;
      }
    }

    if (req.files.profile) {
      let profilePath = __dirname + "/public/uploads/" + req.files.profile.name;
      await req.files.profile.mv(profilePath);
      let profileResult = await cloudinary.uploader.upload(profilePath);
      profileurl = profileResult.secure_url;
    }
  }

  let emailid = req.body.emailid;
  let address = req.body.address;
  let contact = req.body.contact;
  let game = req.body.game;
  let otherinfo = req.body.otherinfo;

  mySqlVen.query("SELECT * FROM players WHERE emailid = ?", [emailid], function (err, result) {
    if (err) {
      resp.send("Database error: " + err.message);
    } else if (result.length > 0) {
      resp.send("This email is already registered.");
    } else {
      let query = `INSERT INTO players 
      (emailid, name, dob, gender, address, contact, game, otherinfo, acardpicurl, profilepicurl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      let values = [
        emailid,
        jsondata.name,
        jsondata.dob,
        jsondata.gender,
        address,
        contact,
        game,
        otherinfo,
        acardurl,
        profileurl
      ];

      mySqlVen.query(query, values, function (errKuch, result) {
        if (errKuch == null) {
          resp.send(`
            <html>
              <body>
                <script>
                  alert("Player profile saved successfully!");
                  window.location.href = "player-dash.html"; 
                </script>
              </body>
            </html>
          `);
        } else {
          resp.send("Error saving: " + errKuch.message);
        }
      });
    }
  });
});

app.post("/update-player", async function (req, resp) {
  let emailid = req.body.emailid;
  let acardpicurl = "";
  let profilepicurl = "";

  // Upload new images if present
  if (req.files?.acard?.name) {
    let filePath = __dirname + "/public/uploads/" + req.files.acard.name;
    await req.files.acard.mv(filePath);
    let result = await cloudinary.uploader.upload(filePath);
    acardpicurl = result.secure_url;
  }

  if (req.files?.profile?.name) {
    let filePath = __dirname + "/public/uploads/" + req.files.profile.name;
    await req.files.profile.mv(filePath);
    let result = await cloudinary.uploader.upload(filePath);
    profilepicurl = result.secure_url;
  }

  let updates = [];
  let values = [];

  function addField(field, value) {
    if (value) {
      updates.push(`${field} = ?`);
      values.push(value);
    }
  }

  addField("name", req.body.name);
  addField("dob", req.body.dob);
  addField("gender", req.body.gender);
  addField("address", req.body.address);
  addField("contact", req.body.contact);
  addField("game", req.body.game);
  addField("otherinfo", req.body.otherinfo);
  if (acardpicurl) addField("acardpicurl", acardpicurl);
  if (profilepicurl) addField("profilepicurl", profilepicurl);

  if (updates.length === 0) {
    return resp.send("No fields to update.");
  }

  let query = `UPDATE players SET ${updates.join(", ")} WHERE emailid = ?`;
  values.push(emailid);

  mySqlVen.query(query, values, function (err, result) {
    if (!err) {
      if (result.affectedRows === 1) {
        resp.send(`<script>alert("Player profile updated successfully!"); location.href="player-dash.html";</script>`);
      } else {
        resp.send("Invalid Email ID");
      }
    } else {
      resp.send("Error: " + err.message);
    }
  });
});
app.get("/fetch-player", function (req, resp) {
  const email = req.query.emailid;

  mySqlVen.query("SELECT * FROM players WHERE emailid = ?", [email], function (err, result) {
    if (err == null) {
      if (result.length === 0) {
        resp.send(`
          <html><body>
          <script>
            alert("No record found for this Email ID.");
            window.location.href = "player-details.html";
          </script>
          </body></html>
        `);
      } else {
        resp.send(result[0]);
      }
    } else {
      resp.send(`
        <html><body>
        <script>
          alert("Error: ${err.message.replace(/"/g, '\\"')}");
          window.location.href = "player-details.html";
        </script>
        </body></html>
      `);
    }
  });
});



//players events explore
app.get("/fetch-eventstoecplore",function(req,resp)
{
        mySqlVen.query("select * from events where city=? and category=?",[req.query.KuchCity,req.query.KuchGame],function(err,allRecords)
        {
                    resp.send(allRecords);
        })
})
app.get("/do-fetch-all-cities", function(req, resp) {
  mySqlVen.query("SELECT DISTINCT city FROM events", function(err, allRecords) {
    console.log("Fetched Cities:", allRecords); // <--- ADD THIS
    resp.send(allRecords);
  });
});



//player update password
app.post("/update-password", (req, res) => {
  const { emailid, oldpass, newpass } = req.body;

  const checkQuery = "SELECT * FROM users2026 WHERE emailid = ? AND pwd = ?";
  mySqlVen.query(checkQuery, [emailid, oldpass], (err, results) => {
    if (err) {
      console.error("Check query error:", err);
      return res.status(500).send("Database error.");
    }

    if (results.length === 0) {
      return res.status(401).send("Old password is incorrect or user does not exist.");
    }

    const updateQuery = "UPDATE users2026 SET pwd = ? WHERE emailid = ?";
    mySqlVen.query(updateQuery, [newpass, emailid], (err2, result2) => {
      if (err2) {
        console.error("Update query error:", err2);
        return res.status(500).send("Failed to update password.");
      }

      res.send("Password updated successfully.");
    });
  });
});


//admin console
app.get("/fetch-users", function (req, res) {
  let query = "SELECT * FROM users2026 ";
  mySqlVen.query(query, function (err, result) {
    if (err) {
      res.send("Error in fetching: " + err);
    } else {
      res.send(result); // Send array of rows
    }
  });
});
app.get("/update-status", function (req, res) {
  const userid = req.query.userid;
  const status = req.query.status;

  const query = "UPDATE users2026 SET status=? WHERE id=?";
  mySqlVen.query(query, [status, userid], function (err, result) {
    if (err) {
      res.status(500).send("Error updating status: " + err);
    } else {
      res.send("Status updated successfully");
    }
  });
});
app.get("/fetch-organizers", function (req, res) {
  var type = req.query.usertype; 
  let query = "SELECT * FROM users2026 WHERE usertype=?";
  mySqlVen.query(query, [type], function (err, result) {
    if (err) {
      res.send("Error in fetching: " + err);
    } else {
      res.send(result); 
    }
  });
});
app.get("/fetch-players", function (req, res) {
  var type = req.query.usertype; 
  let query = "SELECT * FROM users2026 WHERE usertype=?";
  mySqlVen.query(query, [type], function (err, result) {
    if (err) {
      res.send("Error in fetching: " + err);
    } else {
      res.send(result); 
    }
  });
});




