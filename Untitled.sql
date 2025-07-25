USE defaultdb;
 CREATE TABLE users2026 (id INT AUTO_INCREMENT PRIMARY KEY, emailid VARCHAR(100), pwd VARCHAR(100), usertype VARCHAR(50), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, status INT DEFAULT 1); 
 CREATE TABLE organizers (id INT AUTO_INCREMENT PRIMARY KEY,emailid VARCHAR(100),  orgname VARCHAR(100),  regnumber VARCHAR(50),  address VARCHAR(200),  city VARCHAR(50),  sports VARCHAR(100),insta VARCHAR(100),  head VARCHAR(100),  contact VARCHAR(20),picurl VARCHAR(300),dt DATETIME DEFAULT CURRENT_TIMESTAMP,  status INT DEFAULT 1);
select * from users2026;
select * from organizers;

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emailid VARCHAR(100),
  mobile VARCHAR(15),
  event_name VARCHAR(100),
  city VARCHAR(50),
  venue VARCHAR(100),
  start_date DATE,
  end_date DATE,
  min_age INT,  max_age INT,  category VARCHAR(50),  description TEXT,poster_url VARCHAR(500)
);
select * from events;