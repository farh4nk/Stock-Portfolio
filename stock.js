let num = 0;
let init_amt = 0;
let leftover = 0;
let date_values = {};

const holidays = "Jan 02, Jan 16, Feb 20, Apr 07, May 29, Jun 19, Jul 04, Sep 04, Oct 09, Nov 10, Nov 23, Dec 25";

window.onload = function () {


    //sets init_amt, leftover, and remaining amount on HTML
    document.getElementById("initial").onchange = function () {
        init_amt = Number(document.getElementById("initial").value)
        leftover = init_amt
        document.getElementById("remaining").innerHTML = `$ ${leftover}`
        //console.log(init_amt)
    }


    //updates init_amt
    document.getElementById(`stock_select-${num}`)


    //adds new stock
    document.getElementById("add").onclick = function () {
        // new stock row
        document.getElementById("stock-info").insertAdjacentHTML("beforeend",
            `<div class="row p-3 text-center">
            <div class="col-3">
                <label>Exchange</label>
                <select class="form-select" id="exchange-${num}">
                    <option>Choose Exchange</option>
                    <option>NASDAQ</option>
                    <option>NYSE</option>
                </select>
            </div>
        
            <div class="col-3">
                <label>Stock</label>
                <select class="form-select stock_select-${num}" id="stock_select-${num}"></select>
            </div>
        
            <div class="col-2">
                <label for="shares">Shares Bought:</label>
                <input class="form-control shares-${num}" type="number" min="0" oninput="validity.valid||(value='');" id="shares-input-${num}"/>
            </div>
        
            <div class="col-2">
                <label for="date">Date:</label>
                <input class="form-control" type="text" id="datepick-${num}">
            </div>
            <div class="col-2">
                <br>
                <button class="btn btn-primary" id="save_data-${num}">Save Data</button>
            </div>
        </div>`);


        // new stock datepicker
        const input = document.getElementById(`datepick-${num}`);
        stockAPI(num);
        const datepicker = new TheDatepicker.Datepicker(input);
        datepicker.options.setInputFormat("Y-m-d");

        modifyDate(num, datepicker);

        // disable future dates
        // let today = new Date()
        // let day = ("0" + (today.getDate()-2)).slice(-2)
        // let max = new Date(today.getFullYear() + "-" + today.getMonth() + "-" + day);

        // disable weekends and holidays
        datepicker.options.addDateAvailabilityResolver(function (date) {
            // disable weekends
            return date.getDay() !== TheDatepicker.DayOfWeek.Saturday
                && date.getDay() !== TheDatepicker.DayOfWeek.Sunday

                //disable holidays
                && !holidays.includes(String(date).substring(5, 10))
        });
        datepicker.render();

        // deducts stock price
        document.getElementById(`save_data-${num}`).onclick = async function() {
            let symbol = document.getElementById(`stock_select-${num-1}`);
            let selectedDate = document.getElementById(`datepick-${num-1}`);
            url = "https://api.twelvedata.com/time_series?symbol=" + symbol.value.toLowerCase() + "&interval=1day&date=" + selectedDate.value + "&apikey=12f9f583f67f48789eaf18e5a2c00580";
            response = await fetch(url);
            data = await response.json();
            value = data.values[0].close
            console.log(value)
            leftover -= value * Number(document.getElementById(`shares-input-${num-1}`).value);
            document.getElementById("remaining").innerHTML = `$ ${leftover}`

            document.getElementById(`save_data-${num-1}`).disabled = true;
            // https://api.twelvedata.com/time_series?symbol=aaciu&interval=1day&date=2023-12-15&apikey=12f9f583f67f48789eaf18e5a2c00580

            // https://api.twelvedata.com/time_series?symbol=aapl&interval=1day&date=2023-10-27&apikey=12f9f583f67f48789eaf18e5a2c00580
        }

        // update num
        num++;
    };

    // prints portfolio results
    document.getElementById("results-button").onclick = async function () {

        sortedDates = Object.values(date_values).sort();

        newDictionary = {};

        //console.log(date_values);
        for (const date of sortedDates) {
            // https://www.geeksforgeeks.org/how-to-get-a-key-in-a-javascript-object-by-its-value/
            const number = Object.keys(date_values).find(key => date_values[key] === date);
            newDictionary[number] = date;
        }

        date_values = newDictionary;

        results = "";
        for (let i = 0; i < num; i++) {
            let symbol = document.querySelector(".stock_select-" + i);
            url = "https://api.twelvedata.com/time_series?symbol=" + symbol.value + "&interval=1day&apikey=12f9f583f67f48789eaf18e5a2c00580";
            response = await fetch(url);
            dataJson = await response.json();

            // price of each stock multiplied by the number of shares bought
            value = dataJson.values[0].close * document.querySelector(".shares-" + i).value;
            portfolio = value + leftover;
            // console.log(value);

            results +=
                `<tr>
                    <td>${date_values[i]}</td>
                    <td> ${portfolio} </td>
                    <td>${portfolio - init_amt}</td>
                </tr>`
        }

        // sort dates from newest to oldest
        //console.log(date_values);

        // insert data
        document.getElementById("results-body").innerHTML = results;

        // display table
        document.getElementById("results-table").classList.remove("invisible")
    };
}

// modal
document.addEventListener("DOMContentLoaded", function () {
    const apiKey = getCookie("apiKey");
    const host = getCookie("host");

    if (apiKey && host) {
      document.getElementById("apiKey").value = apiKey;
      document.getElementById("host").value = host;
    }

    document.getElementById('simpleModal').style.display = "block";
  });

  function handleFormSubmit() {
    const apiKeyInput = document.getElementById("apiKey").value;
    const hostInput = document.getElementById("host").value;

    setCookie("apiKey", apiKeyInput);
    setCookie("host", hostInput);

    document.getElementById("simpleModal").style.display = "none";
    //debugging
    console.log("Form submitted:", getCookie("apiKey"), getCookie("host"));
    return false;
  }

  function handleEditFormSubmit() {
    const editApiKeyInput = document.getElementById("editApiKey").value;
    const editHostInput = document.getElementById("editHost").value;

    setCookie("apiKey", editApiKeyInput);
    setCookie("host", editHostInput);

    document.getElementById("editModal").style.display = "none";
    //debugging
    console.log("Edit form submitted:", getCookie("apiKey"), getCookie("host"));
    return false;
  }

  function openEditModal() {
    document.getElementById("editModal").style.display = "block";

    document.getElementById("editApiKey").value = getCookie("apiKey");
    document.getElementById("editHost").value = getCookie("host");
  }

  function openEditModal() {
    document.getElementById("editModal").style.display = "block";

    document.getElementById("editApiKey").value = getCookie("apiKey");
    document.getElementById("editHost").value = getCookie("host");
  }

  function handleEditFormSubmit() {
    const editApiKeyInput = document.getElementById("editApiKey").value;
    const editHostInput = document.getElementById("editHost").value;

    setCookie("apiKey", editApiKeyInput);
    setCookie("host", editHostInput);

    document.getElementById("editModal").style.display = "none";
    return false;
  }

  function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
  }

  function closeModal() {
    document.getElementById("simpleModal").style.display = "none";
  }

  function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split("=");
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  }

  function setCookie(name, value) {
    document.cookie = `${name}=${value}`;
  }

const populateStonks = async function (data, num) {
    const stonks = document.querySelector(".stock_select-" + num);

    if (data == '') {
        stonks.innerHTML = "";
    } else {
        stonks.innerHTML = "";

        const stonkData = data.data;
        for (const stonk of stonkData) {
            const maxLength = 20;
            const shortenName = stonk.name.length > maxLength ? stonk.name.slice(0, maxLength) + "..." : stonk.name;

            let tempHTML = `<option value="${stonk.symbol}">${stonk.symbol} - ${shortenName}</option>`;
            stonks.insertAdjacentHTML("beforeend", tempHTML);
        }
    }
}

const stockAPI = async function (num) {
    const stockOption = document.getElementById("exchange-" + num);
    stockOption.addEventListener('change', async function () {
        let url = '';
        if (stockOption.value == "NASDAQ") {
            url = 'https://twelve-data1.p.rapidapi.com/stocks?exchange=NASDAQ&format=json';
        }
        if (stockOption.value == "NYSE") {
            url = 'https://twelve-data1.p.rapidapi.com/stocks?exchange=NYSE&format=json';
        }
        if (stockOption.value == "Choose Exchange") {
            url = '';
        }

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '981e8083femsh544f62b63104505p14aa68jsn3593eb4cc861',
                'X-RapidAPI-Host': 'twelve-data1.p.rapidapi.com'
            }
        };

        try {
            let dataJson;
            if (url != '') {
                const response = await fetch(url, options);
                dataJson = await response.json();
            }
            populateStonks(dataJson, num);
        } catch (error) {
            console.error(error);
        }
    });
}

const modifyDate = async function (num, datepicker) {
    // add stock results to array
    datepicker.options.onSelect(function (event, day, previousDay) {

        selectedDate = datepicker.getSelectedDateFormatted("Y-m-d");
        // console.log(selectedDate);

        date_values[num] = selectedDate;
        // console.log(date_values);
    })
}
