/**
 * 用户管理模块
 */
const router = require("koa-router")();
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const User = require("../models/userSchema");
const Counter = require("../models/counterSchema");
const util = require("../utils/util");

router.prefix("/users");

// 用户登录
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
        expiresIn: "1h",
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

// 用户列表
router.get("/list", async (ctx) => {
  const { userId, userName, state } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query);
  const params = {};
  if (userId) params.userId = userId;
  if (userName) params.userName = userName;
  if (state) params.satate = state;
  try {
    const query = User.find(
      { ...params, state: { $lt: 4 } },
      { _id: 0, userPwd: 0 }
    );
    const total = await User.count({ ...params, state: { $lt: 4 } });
    // skip跳过指定条数;limit查询结果的最大条数
    const list = await query.skip(skipIndex).limit(page.pageSize);
    ctx.body = util.success({
      page: {
        ...page,
        total,
      },
      list,
    });
  } catch (error) {
    ctx.body = util.fail(`查询异常:${error.stack}`);
  }
});

// 用户删除
router.post("/delete", async (ctx) => {
  const { userIds } = ctx.request.body;
  const res = await User.updateMany({ userId: { $in: userIds } }, { state: 4 });
  if (res.modifiedCount) {
    ctx.body = util.success(true, `共删除成功${res.modifiedCount}条`);
    return;
  }
  ctx.body = util.fail(false, "删除失败");
});

// 用户新增/编辑
router.post("/operate", async (ctx) => {
  const {
    userId,
    userName,
    userEmail,
    mobile,
    job,
    state,
    roleList,
    deptId,
    action,
  } = ctx.request.body;
  if (action === "add") {
    if (!userName || !userEmail || !deptId) {
      ctx.body = util.fail("参数错误", util.CODE.PARAM_ERROR);
      return;
    }
    const res = await User.findOne(
      { $or: [{ userName }, { userEmail }] },
      "_id userName userEmail"
    );
    if (res) {
      ctx.body = util.fail("该用户已存在");
    } else {
      const doc = await Counter.findOneAndUpdate(
        { _id: "userId" },
        { $inc: { sequence_value: 1 } },
        { new: true }
      );
      try {
        new User({
          userId: doc.sequence_value,
          userName,
          userPwd: md5("123456"),
          userEmail,
          role: 1,
          roleList,
          job,
          state,
          deptId,
          mobile,
        }).save();
        ctx.body = util.success(true, "创建成功");
      } catch (error) {
        ctx.body = util.fail(error.stack, "创建失败");
      }
    }
  } else {
    if (!deptId) {
      ctx.body = util.fail("部门不能为空", util.CODE.PARAM_ERROR);
      return;
    }
    try {
      await User.findOneAndUpdate(
        { userId },
        { mobile, job, state, roleList, deptId }
      );
      ctx.body = util.success({}, "更新成功");
    } catch (error) {
      ctx.body = util.fail(error.stack, "更新失败");
    }
  }
});
module.exports = router;
