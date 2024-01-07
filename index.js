const https = require("https");
const express = require("express");
const request = require("request");
const axios = require("axios");
const app = express();

const liff = require("@line/liff");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.post("/webhook", async function (req, res) {
  // console.log("req--> ", req.body.events[0]);
  console.log("start webhook --> ");
  let msg = "";
  let channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  // "XCbn+/dWhb3qNdTx3tGnQqeomc6z0IESqX2FZ6m+2e+lthKeE4qwGjVHG/+Tz0jLwdKeJrvIXP6262lbzvXF+vm64Q0NL6wVtvaX2dTog/aFmOpQ82MOqWHKA8RsK7KfklLW6AAcInzGDLyFtxhB1gdB04t89/1O/w1cDnyilFU=";
  let inputMessage = "";
  let UserID = "";
  let NAME = "";
  let _url = "";
  let URL = "";
  let inputMessageArr = [];
  let displayName = "";
  let _destination = req.body.destination;
  const botUserId = req.body.events[0].source.userId;

  //console.log("input text:===> ", inputMessage);

  //convert timestamp
  let _timeStamp = req.body.events[0].timestamp;
  let dt = new Date(_timeStamp).toUTCString();
  if (req.body.events[0].type === "message") {
    let getData = [];

    inputMessage = req.body.events[0].message.text;
    //****** */
    //console.log("botUserId:===> ", botUserId);
    await axios
      .get(
        "https://mkt-linebot-nodejs-production.up.railway.app/api/userGtms/" +
          botUserId
      )
      //.get("https://jsonplaceholder.typicode.com/todos/1")
      .then((response) => {
        console.log("start webhook find botUserId--> ");
        getData = response.data;
        //console.log("response =====>  ", response.data.values);
        //console.log("response =====>  ", response.data);
      });

    // TODO CONDITION **********
    if (getData.message === "NO FOUND DATA") {
      console.log("NO DATA IN CHATBOT=====>  ", getData.message);

      const dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: setRegister(botUserId),
      });

      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + channelAccessToken,
      };

      const webhookOptions = {
        hostname: "api.line.me",
        path: "/v2/bot/message/reply",
        method: "POST",
        headers: headers,
        body: dataString,
      };

      const request = https.request(webhookOptions, (res) => {
        res.on("data", (d) => {
          process.stdout.write(d);
        });
      });

      request.on("error", (err) => {
        console.error(err);
      });

      request.write(dataString);
      request.end();
    } else if (getData.message === "FOUND DATA") {
      // console.log("FOUND DATA =====>  ", getData.sendData);
      // console.log("FOUND DATAMESSAGE=====>  ", getData.message);

      //Todo chat message check condition
      if (inputMessage === "Promotions_show") {
        console.log("Promotions_show =====>  ");
        //Todo SEND TO API
        // Send to GA API
        messageToApiA(botUserId, inputMessage);
        // payload data *******************
        const dataString = JSON.stringify({
          replyToken: req.body.events[0].replyToken,
          messages: samplePayload(),
        });

        const headers = {
          "Content-Type": "application/json",
          Authorization: "Bearer " + channelAccessToken,
        };

        const webhookOptions = {
          hostname: "api.line.me",
          path: "/v2/bot/message/reply",
          method: "POST",
          headers: headers,
          body: dataString,
        };

        const request = https.request(webhookOptions, (res) => {
          res.on("data", (d) => {
            process.stdout.write(d);
          });
        });

        request.on("error", (err) => {
          console.error(err);
        });

        request.write(dataString);
        request.end();

        // payload data ******************* end
      } else if (inputMessage === "Main_menu") {
        console.log("Main_menu =====>  ");
        //Todo SEND TO API
      } else {
        console.log("IGNORE =====>  ");
        // const dataString = JSON.stringify({
        //   replyToken: req.body.events[0].replyToken,
        //   messages: samplePayload(),
        // });

        // const headers = {
        //   "Content-Type": "application/json",
        //   Authorization: "Bearer " + channelAccessToken,
        // };

        // const webhookOptions = {
        //   hostname: "api.line.me",
        //   path: "/v2/bot/message/reply",
        //   method: "POST",
        //   headers: headers,
        //   body: dataString,
        // };

        // const request = https.request(webhookOptions, (res) => {
        //   res.on("data", (d) => {
        //     process.stdout.write(d);
        //   });
        // });

        // request.on("error", (err) => {
        //   console.error(err);
        // });

        // request.write(dataString);
        // request.end();
      }
    }
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

async function findDataFromBotUserId(botUserId) {
  try {
    let resData = "";
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url:
        "https://mkt-linebot-nodejs-production.up.railway.app/api/userGtms/" +
        botUserId,
      headers: {},
    };

    await axios
      .request(config)
      .then((response) => {
        // console.log(
        //   "findDataFromBotUserId---> ",
        //   JSON.stringify(response.data)
        // );
        resData = response.data;
      })
      .catch((error) => {
        console.log(error);
      });
    return resData;
  } catch (err) {
    console.log("err---> ", err);
  }
}

//TODO API FROM INPUT MESSAGE

async function messageToApiA(botUserId, inputMessage) {
  //find data from db & input param ******
  await findDataFromBotUserId(botUserId).then((_resData) => {
    console.log("checkBotUserId-->data ******* ", _resData.sendData);
    console.log("utm_source-->", _resData.sendData.utm_source);
    console.log("utm_medium-->", _resData.sendData.utm_medium);
    console.log("utm_term-->", _resData.sendData.utm_term);
    if (_resData.message === "FOUND DATA") {
      let data = JSON.stringify({
        client_id: _resData.sendData.client_id,
        user_id: _resData.sendData.userId,
        non_personalized_ads: false,
        user_properties: {
          ipAddress: {
            value: _resData.sendData.ipAddressWebStart,
          },
        },
        events: [
          {
            name: "LinePromotion",
            params: {
              campaign_id: inputMessage + _resData.sendData.userId,
              campaign: inputMessage,
              source: _resData.sendData.utm_source,
              medium: _resData.sendData.utm_medium,
              term: _resData.sendData.utm_term,
              content: "Check Conversion from LinePromotion",
              client_id: _resData.sendData.client_id,
              user_id: _resData.sendData.userId,
              ipAddress: _resData.sendData.ipAddressWebStart,

              session_id: _resData.sendData.sessionId,
              uniqueEventId: _resData.sendData.uniqueEventId,
              userAgent: _resData.sendData.userAgent,

              lineUid: _resData.sendData.lineUid,
              botUserId: _resData.sendData.botUserId,
              lineDisplayName: _resData.sendData.lineDisplayName,

              timeStamp: _resData.sendData.timeStamp,

              // hold
              //utm_source: _resData.sendData.utm_source, // ติดตาม Ads
            },
          },
        ],
      });

      // const _measurement_id = "G-NQVBY4R09H";
      // const _api_secret = "qGYzy_flTGO0Ksd6MHC1_w";
      // const _url = `https://www.google-analytics.com/mp/collect?measurement_id=${{
      //   _measurement_id,
      // }}&api_secret=${{ _api_secret }}`;

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        //url: _url,
        url: "https://www.google-analytics.com/mp/collect?measurement_id=G-NQVBY4R09H&api_secret=qGYzy_flTGO0Ksd6MHC1_w",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });

  //******* */
}

//payload sample

function setRegister(botUserId) {
  console.log("botUserId -> ", botUserId);
  var urlLiff = `line://app/1656824759-qbyK4305/path?botUserId=` + botUserId;
  // var urlLiff =
  //   `line://app/1656824759-qbyK4305/path?botUserId=` +
  //   botUserId +
  //   "&setIpAddress=223.204.232.28";

  console.log("urlLiff -> ", urlLiff);
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

            // uri: "line://app/1656824759-qbyK4305",
            uri: urlLiff,
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

//Todo playload

function samplePayload() {
  console.log("test send payLoad-->");
  return [
    {
      type: "template",
      altText: "this is a confirm template",
      template: {
        columns: [
          {
            title: "เบียร์สด หรือ นามะบีรุ",
            actions: [
              {
                type: "uri",
                uri: "https://liff.line.me/2001254953-w391eWy1",
                label: "รายละเอียด",
              },
            ],
            text: "เป็นเครื่องดื่มที่ทางร้านนาเอบะขาดไม่ได้เลย ลูกค้ามักจะถามถึงเป็นอันดับแรก",
            thumbnailImageUrl:
              "https://naebaizakaya.com/wp-content/uploads/2023/11/1-1.jpg",
          },
          {
            actions: [
              {
                type: "uri",
                uri: "https://liff.line.me/2001254953-w391eWy1",
                label: "รายละเอียด",
              },
            ],
            title: "เมนูเสียบไม้ หรือ ยากิโทริ",
            text: "ยากิโทริคือไก่ย่างเสียบไม้โดยจะมีไก่หลายส่วนให้เลือก",
            thumbnailImageUrl:
              "https://naebaizakaya.com/wp-content/uploads/2023/11/2-2.jpg",
          },
          {
            text: "เป็นเครื่องดื่มอีกชนิดที่ลูกค้าที่ร้านนาเอบะชอบสั่งมาดื่มกัน มีรสชาติหวานอมเปรี้ยว",
            thumbnailImageUrl:
              "https://naebaizakaya.com/wp-content/uploads/2023/11/3-1.jpg",
            actions: [
              {
                label: "รายละเอียด",
                uri: "https://liff.line.me/2001254953-w391eWy1",
                type: "uri",
              },
            ],
            title: "เหล้าบ๊วย หรือ อุเมะชุ",
          },
          {
            title: "หม้อไฟ หรือ นาเบะ",
            actions: [
              {
                type: "uri",
                label: "รายละเอียด",
                uri: "https://liff.line.me/2001254953-w391eWy1",
              },
            ],
            text: "คืออาหารที่ใส่ผัก,เห็ด,เนื้อสัตว์,เต้าหู้ และเส้น ลงในหม้อแล้วพร้อมเสริฟ",
            thumbnailImageUrl:
              "https://naebaizakaya.com/wp-content/uploads/2023/11/4-1.jpg",
          },
        ],
        type: "carousel",
        imageSize: "cover",
        imageAspectRatio: "square",
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
