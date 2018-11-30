
function setup() {
    htmltable = document.getElementById("tablebox");
    button = document.getElementById("convert");
    result = document.getElementsByTagName("result")[0];

    button.addEventListener('click', function () {
        var table=document.createElement("div");
        table.innerHTML=htmltable.value ;
        tbody=table.getElementsByTagName("table");

        for(var i = 0; i < tbody.length; i++){
            row = tbody[i].getElementsByTagName("tr") ;

            for(var j = 0; j < row.length; j++) {
                col = row[j].getElementsByTagName("td");

                if(j == 0) {
                    var colmax = new Array(col.length);
                }

                for(var k = 0; k < col.length; k++){
                    if(j == 0) {
                        colmax[k] = col[k].innerHTML.length;
                    } else {
                        if(colmax[k] < col[k].innerHTML.length) {
                            colmax[k] = col[k].innerHTML.length;
                        }
                    }
                }
            }
        }

        for(var i = 0; i < tbody.length; i++){
            row = tbody[i].getElementsByTagName("tr") ;

            for(var j = 0; j < row.length; j++) {
                col = row[j].getElementsByTagName("td");
                
                for(var k = 0; k < col.length; k++){
                    if(k == 0){
                        result.innerHTML += "|"
                    }

                    result.innerHTML += col[k].innerHTML ;

                    for(let m = 0; m < colmax[k] - col[k].innerHTML.length; m++) {
                        result.innerHTML += " " ;
                    }

                    result.innerHTML += "|" ;
                }

                result.innerHTML += "<br>"
                
                if (j == 0) {
                    for (var k = 0; k < col.length; k++) {
                        if (k == 0) {
                            result.innerHTML += "|"
                        }

                        for(let m = 0; m < colmax[k]; m++) {
                            result.innerHTML += "-" ;
                        }

                        result.innerHTML += "|";
                    }

                    result.innerHTML += "<br>"
                }
            }
        }
    });
}

setup();
