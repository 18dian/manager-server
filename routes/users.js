/**
 * 用户管理模块
 */
const router = require("koa-router")();
const User = require("../models/userSchema");
const util = require("../utils/util");

router.prefix("/users");

router.post("/login", async (ctx) => {
  const { userName, userPwd } = ctx.request.body;
  try {
    const res = await User.find({
      userName,
      userPwd,
    });
    if (res) {
      ctx.body = util.success(res);
    } else {
      ctx.body = util.fail("账号或密码不正确");
    }
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

module.exports = router;
