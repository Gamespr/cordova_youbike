/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

document.addEventListener('deviceready', onDeviceReady, true);

    const sareaArray = [ //選單
        ["中正區"],
        ["萬華區"],
        ["大同區"],
        ["中山區"],
        ["松山區"],
        ["大安區"],
        ["信義區"],
        ["內湖區"],
        ["南港區"],
        ["士林區"],
        ["北投區"],
        ["文山區"]]

    let sArray=[];

    
    function checkConnection() {
        var networkState = navigator.connection.type;
        if (networkState === Connection.NONE) {
            alert("沒有網路連線...");
            navigator.app.exitApp(); // 離開應用程式
        }
    }

    function GetData(sarea){
        var url="https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";
        cordova.plugin.http.sendRequest(url, {method:'get'}, 
        function(response) {
            result = JSON.parse(response.data);

            $("#resultList").empty();
            for(let i = 0; i < result.length; i++){
                if(result[i].sarea==sarea){
                    let last = result[i].tot - result[i].sbi;

                    let li = $("<li>").append($("<h2>").text(result[i].sna));
                    li.append($("<div>").text("地點："+result[i].ar).append($("<a>").addClass("ui-icon-star ui-btn ui-btn-inline ui-btn-icon-notext ui-btn-right ui-corner-all").attr("value",i)));
                    li.append($("<div>").text("借："+result[i].sbi+" 還："+last))


                    $("#resultList").append(li);
                }
            }
            $("#resultList").listview("refresh");

            // getStorage(result);

        }, 
        function(response) {
            console.log(JSON.stringify(response));
        });

    }


    function insertSareaName(){
        sareaArray.forEach((item, index)=>{
            var attrs={
                'value': item[0],
                'text': item[0]
            };
            $('<option/>', attrs).appendTo('#sareas');
        })
        // $("#sareas").selectmenu("refresh", true);
    }

    function onDeviceReady() {
        checkConnection();   
        
        let lastArray=[];
        lastArray=JSON.parse(localStorage.getItem("value"));
        if(lastArray){
            lastArray.forEach((item,index)=>{
            sArray.push(item);
        })}
        console.log(sArray);
        getStorage();   //每次開啟取得儲存在localStorage的資料並建立html在我的最愛
        

        $('#sareas').change(function () {    //選單點擊
            var sarea = $('#sareas').val()
            console.log(sarea)
            $.mobile.loading("show");
            GetData(sarea);
            $.mobile.loading("hide");
        });

        insertSareaName();  //下拉式選單


        $("#resultList").on("click","a",function(){ //listview點擊
            let s = $(this).attr("value");
    
            createStorage(s);
            console.log(localStorage.getItem("value"));

            getStorage();

        });


        $("#myfavorList").on("click","a",function(){    //我的最愛點擊
            let v = Number($(this).attr("value"));
            console.log(v);
            console.log("click success");

            removeStorage(v);
        });

    }

    function createStorage (s) {    //儲存localstorage資料並檢查資料有無重複

        
        if(sArray.indexOf(Number(s))>=0){
            alert("已在我的最愛！");
        }
        else if(sArray.indexOf(Number(s))<0){
            sArray.push(Number(s));
        }
        //將資料放入陣列
                
        localStorage.setItem("value", JSON.stringify(sArray));
        console.log("success");

        getStorage();
        
    }

    function getStorage() { //依據取得的localStorage資料去建立對應的JSON資料的html
        
        var url="https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";
        cordova.plugin.http.sendRequest(url, {method:'get'}, 
        function(response) {

            result = JSON.parse(response.data);

            let v = JSON.parse(localStorage.getItem("value"));

            $("#myfavorList").empty();

            v.forEach((item, index)=>{

                let last = result[item].tot - result[item].sbi;

                let li = $("<li>").attr("value",item).append($("<h2>").text(result[item].sna));
                li.append($("<div>").text("地點："+result[item].ar).append($("<a>").addClass("ui-icon-delete ui-btn ui-btn-inline ui-btn-icon-notext ui-btn-right ui-corner-all").attr("value",item)));
                li.append($("<div>").text("借："+result[item].sbi+" 還："+last))

                $('#myfavorList').append(li);

        })

        $("#myfavorList").listview("refresh");

        },
        function(response) {
            console.log(JSON.stringify(response));
        });

    }

    function removeStorage(v) { //刪除資料及指定的li元素

        //sArray陣列做指定刪除
        sArray.forEach((item,index)=>{
            if(item==v){
                sArray.splice(index,1);
                $("li[value='"+item+"']").remove();
           }
        })

        localStorage.setItem("value", JSON.stringify(sArray));

        $("#myfavorList").listview("refresh");

    }
