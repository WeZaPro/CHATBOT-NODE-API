const https = require("https");
const express = require("express");
const request = require("request");
const axios = require("axios");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.post("/webhook", async function (req, res) {
  let msg = "";
  let channelAccessToken =
    "XCbn+/dWhb3qNdTx3tGnQqeomc6z0IESqX2FZ6m+2e+lthKeE4qwGjVHG/+Tz0jLwdKeJrvIXP6262lbzvXF+vm64Q0NL6wVtvaX2dTog/aFmOpQ82MOqWHKA8RsK7KfklLW6AAcInzGDLyFtxhB1gdB04t89/1O/w1cDnyilFU=";
  let inputMessage = "";
  let UserID = "";
  let NAME = "";
  let _url = "";
  let URL = "";
  let inputMessageArr = [];
  let displayName = "";
  let _destination = req.body.destination;
  const _userId = req.body.events[0].source.userId;
  console.log("_userId ===> ", _userId);
  // console.log("Destination ===> ", _destination);
  // console.log("req body===> ", req.body);
  // console.log("destination:===> ", req.body.destination);
  // console.log("events:===> ", req.body.events);
  //console.log("events:===> ", req.body.events[0]);
  // console.log("events type:===> ", req.body.events[0].type);
  // console.log("timestamp:===> ", req.body.events[0].timestamp);
  // console.log("type:===> ", req.body.events[0].source.type);
  //console.log("userId:===> ", req.body.events[0].source.userId);
  // console.log("replyToken:===> ", req.body.events[0].replyToken);
  // console.log("message text:===> ", req.body.events[0].message.text);
  // console.log("message id:===> ", req.body.events[0].message.id);
  // console.log(
  //   "message quoteToken::===> ",
  //   req.body.events[0].message.quoteToken
  // );

  //console.log("input text:===> ", inputMessage);

  //convert timestamp
  let _timeStamp = req.body.events[0].timestamp;
  let dt = new Date(_timeStamp).toUTCString();

  if (req.body.events[0].type === "message") {
    let getData = [];

    inputMessage = req.body.events[0].message.text;
    //spilt inputMessage
    // inputMessageArr = inputMessage.split("/");
    // if (inputMessageArr[0] === "Register") {
    //   displayName = inputMessageArr[1];
    // }
    // console.log("inputMessageArr:===> ", inputMessageArr);
    // console.log("displayName:===> ", displayName);
    // console.log("input text:===> ", inputMessage);
    // console.log("req.body.events[0].message:===> ", req.body.events[0].message);
    //****** */
    // .get(`http://localhost:8080/api/userGtms/${_userId}`) // get userID
    await axios
      .get(
        //`http://localhost:8080/api/userGtms/U634375582d774e1c8ce69c31f6f1ba48`
        "https://jsonplaceholder.typicode.com/todos/1"
      ) // get userID
      .then((response) => {
        getData = response.data;
        //console.log("response =====>  ", response.data.values);
        console.log("response =====>  ", response);
      });

    //console.log("getData.length =====>  ", getData.length);

    // if (getData.status === "OK") {
    //   console.log("FOUND DATA ==> ");
    //   console.log("getData =====>  ", getData.data);
    // } else {
    //   console.log("NOT FOUND DATA ==> ");

    //   const dataString = JSON.stringify({
    //     replyToken: req.body.events[0].replyToken,
    //     messages: setRegister(),
    //   });

    //   const headers = {
    //     "Content-Type": "application/json",
    //     Authorization: "Bearer " + channelAccessToken,
    //   };

    //   const webhookOptions = {
    //     hostname: "api.line.me",
    //     path: "/v2/bot/message/reply",
    //     method: "POST",
    //     headers: headers,
    //     body: dataString,
    //   };

    //   const request = https.request(webhookOptions, (res) => {
    //     res.on("data", (d) => {
    //       process.stdout.write(d);
    //     });
    //   });

    //   request.on("error", (err) => {
    //     console.error(err);
    //   });

    //   request.write(dataString);
    //   request.end();
    // }
    //================
  } else if (req.body.events[0].type === "postback") {
    console.log(
      "req.body.events[0].postback.data===> ",
      req.body.events[0].postback.data
    );

    let getPostback = req.body.events[0].postback;
    let getPostbackData = req.body.events[0].postback.data;

    console.log("getPostback===> ", getPostback);
    console.log("getPostbackData===> ", getPostbackData);

    // var splitarr = getPostbackData.split("&");
    // console.log("splitarr===> ", splitarr);

    const result = getPostbackData
      .split("&")
      .map((e) => e.split("="))
      // .map(([action, itemid]) => ({ action, itemid }));
      .map(([key, data]) => {
        console.log("map key===> ", key);
        console.log("map data===> ", data);
        return data;
      });

    console.log("result===> ", result);

    let _action = result[0];
    let _itemid = result[1];
    console.log("action===> ", _action);
    console.log("itemid===> ", _itemid);

    let reply_token = req.body.events[0].replyToken;
    reply(reply_token, channelAccessToken, _action, _itemid);
    res.sendStatus(200);
  }
});

// save data to google sheet
async function saveData(inputMessage, _userId, _destination) {
  console.log("SAVE DATA==> ");
  await axios

    //.post("https://sheetdb.io/api/v1/9prcpzpde5iuk", {
    .post("http://localhost:3001/user", {
      UserID: _userId,
      Destination: _destination,
      NAME: inputMessage,
      PHONE: "0873695050",
      URL: "https://onlinesabuyme.co.th/wp-content/uploads/2022/09/LINE_ALBUM_2022_4.9.26_220926-1024x1024.jpg",
    })
    .then(function (response) {
      console.log("response.json==> ", JSON.parse(response.config.data));
      console.log("response.config.data==> ", response.config.data);
      NAME = JSON.parse(response.config.data).NAME;
    })
    .catch(function (error) {
      console.log(error);
    });
}

function dtPayLoad() {
  return [
    {
      type: "text",
      text: "Hello Quick Reply!",
      quickReply: {
        items: [
          {
            type: "action",
            action: {
              type: "datetimepicker",
              label: "Datetime Picker",
              data: "storeId=12345",
              mode: "datetime",
              initial: "2018-09-11T00:00",
              max: "2018-12-31T23:59",
              min: "2018-01-01T00:00",
            },
          },
        ],
      },
    },
  ];
}

//payload sample
//Todo Hold
function carouselPayload(URL) {
  return [
    {
      type: "template",
      altText: "this is a carousel template",
      template: {
        type: "carousel",
        imageAspectRatio: "square",
        imageSize: "cover",
        columns: [
          {
            thumbnailImageUrl:
              "https://onlinesabuyme.co.th/wp-content/uploads/2022/09/7587683-15-1-920x920.png",
            title: `ชื่อ --- `,
            text: "กล่องแบบมาตรฐาน มีฝาปิด-เปิดเฉพาะด้านบน ด้านล่างเป็นระบบออโต",
            actions: [
              {
                label: "รายละเอียดสินค้า",
                type: "uri",
                uri: "https://onlinesabuyme.co.th/wp-content/uploads/2022/09/7587683-15-1-920x920.png",
              },
              {
                uri: "https://onlinesabuyme.co.th/wp-content/uploads/2022/09/1-1-1024x1024.png",
                type: "uri",
                label: "ตารางราคา",
              },
              {
                type: "uri",
                uri: "http://www.siriexpress.net/product/packaging-7/",
                label: "สั่งซื้อเลย",
              },
            ],
          },
          {
            thumbnailImageUrl:
              "https://onlinesabuyme.co.th/wp-content/uploads/2022/09/7587683-15-1-920x920.png",
            title: `ชื่อ --- `,
            text: "กล่องแบบมาตรฐาน มีฝาปิด-เปิดเฉพาะด้านบน ด้านล่างเป็นระบบออโต",
            actions: [
              {
                label: "รายละเอียดสินค้า",
                type: "uri",
                uri: "https://onlinesabuyme.co.th/wp-content/uploads/2022/09/7587683-15-1-920x920.png",
              },
              {
                uri: "https://onlinesabuyme.co.th/wp-content/uploads/2022/09/1-1-1024x1024.png",
                type: "uri",
                label: "ตารางราคา",
              },
              {
                type: "uri",
                uri: "http://www.siriexpress.net/product/packaging-7/",
                label: "สั่งซื้อเลย",
              },
            ],
          },
        ],
      },
    },
  ];
}
function setRegister() {
  return [
    {
      type: "template",
      altText: "this is a confirm template",
      template: {
        type: "confirm",
        text: "ต้องการที่จะติดต่อพนักงานหรือไม่?",
        actions: [
          {
            // type: "message",
            // label: "ใช่",
            // text: "yes",
            type: "uri",
            label: "YES",
            // uri: "https://liff.line.me/1656824759-dzZxJlQ9",
            //uri: "https://line.me/R/app/1656824759-dzZxJlQ9",
            // uri: "https://liff.line.me/1656824759-8lnLR5ak",
            // uri: "https://liff.line.me/1656824759-qbyK4305",
            uri: "line://app/1656824759-qbyK4305", // use --> https://vue-weba-crossdomain.onrender.com --> redirect --> https://vue-line-liff-conversion.onrender.com
            //uri: "line://app/1656824759-PonrgLDq", // use
          },
          {
            type: "message",
            label: "NO",
            text: "NO",
          },
        ],
      },
    },
  ];
}

// Postback
function reply(reply_token, channelAccessToken, action, itemid) {
  let headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + channelAccessToken,
  };
  let body = JSON.stringify({
    replyToken: reply_token,
    messages: [
      {
        type: "text",
        text: `action : ${action}`,
      },
      {
        type: "text",
        text: `itemid : ${itemid}`,
      },
    ],
  });
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body,
    },
    (err, res, body) => {
      console.log("status = " + res.statusCode);
    }
  );
}
app.get("/", function (req, res) {
  res.status(200).send("Chatbot Tutorial");
});
//

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
