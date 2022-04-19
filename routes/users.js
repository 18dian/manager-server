/**
 * 用户管理模块
 */
const router = require("koa-router")();
const User = require("../models/userSchema");
const util = require("../utils/util");
const jwt = require("jsonwebtoken");

router.prefix("/users");

router.post("/login", async (ctx) => {
  const { userName, userPwd } = ctx.request.body;
  try {
    const res = await User.findOne({
      userName,
      userPwd,
    });
    if (res) {
      const data = res._doc;
      const token = jwt.sign({ data: res }, "my-token", {
        expiresIn: 30,
      });
      data.token = token;
      ctx.body = util.success(data);
    } else {
      ctx.body = util.fail("账号或密码不正确");
    }
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

module.exports = router;
