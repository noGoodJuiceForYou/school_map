package com.map.controller.user;

import com.alibaba.cloud.ai.dashscope.api.DashScopeApi;
import com.alibaba.cloud.ai.dashscope.chat.DashScopeChatModel;
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import com.alibaba.cloud.ai.graph.exception.GraphRunnerException;
import com.map.pojo.DTO.UserCommentDTO;
import com.map.pojo.Result;
import com.map.pojo.UserComment;
import com.map.service.UserCommentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/user/comment")
public class UserCommentController {

    @Value("${spring.ai.dashscope.api-key}")
    private String apiKey;

    @Autowired
    private UserCommentService userCommentService;

    @PostMapping("/add")
    public Result add(@RequestBody UserComment userComment) throws GraphRunnerException {
        log.info("用户添加评论：{}", userComment);

        log.info("apiKey: {}", apiKey);

        // 初始化 ChatModel
        DashScopeApi dashScopeApi = DashScopeApi.builder()
                .apiKey(apiKey)
                .build();

        ChatModel chatModel = DashScopeChatModel.builder()
                .dashScopeApi(dashScopeApi)
                .build();

        String systemPrompt = """
                你是一个内容审核助手，请审核用户发表的评论，判断是否合规。
                
                【审核规则】
                **严格禁止：**
                1. 人身攻击：辱骂、侮辱性称呼（如"SB""智障"等）
                2. 校园霸凌：嘲讽、孤立、威胁他人
                3. 色情内容：擦边、约炮、成人话题
                4. 暴力极端行为：约架、伤害他人、自杀引导
                5. 泄露隐私：真实姓名、学号、电话、宿舍号等
                6. 政治敏感：违反校规和国家法律法规的内容
                
                **需要人工审核**
                1. 引战言论："XX专业就是垃圾""XX社团都是装逼"
                2. 无意义灌水："ddd""111""路过水经验"
                3. 阴阳怪气：讽刺、冷嘲热讽（非直接辱骂）
                4. 歪楼刷屏：多次重复评论、偏离主题过远
                5. 广告推广：校外商业推广、代课代考
                
                **允许**
                1. 课程评价：批评老师严格、课程难（非人身攻击）
                2. 食堂/宿舍吐槽：合理抱怨（非恶意抹黑）
                3. 恋爱话题：正常讨论（非色情）
                4. 考试焦虑：发泄压力（非极端言论）
                5. 其他正常言论
                
                【输出格式】
                若审核通过，返回0；若审核不通过，则返回1；若需人工审核，则返回2
                """;

        ReactAgent agent = ReactAgent.builder()
                .name("评论审核员")
                .model(chatModel)
                .systemPrompt(systemPrompt)
                .build();
        String result = agent.call(new UserMessage(userComment.getContent())).getText();
        if ("0".equals(result)) {
            userComment.setNeedsReview(0);
            userCommentService.add(userComment);
            return Result.success();
        }
        if ("2".equals(result)) {
            userComment.setNeedsReview(2);
            userCommentService.add(userComment);
            return Result.success();
        }
        return Result.error("检测到您的评论存在违规内容，请修改！");
    }

    @GetMapping("/list")
    public Result<List<UserCommentDTO>> getCommentsByLocationId(@RequestParam Integer locationId) {
        log.info("获取地点评论：{}", locationId);
        List<UserCommentDTO> comments = userCommentService.getCommentsByLocationId(locationId);
        return Result.success(comments);
    }

    @DeleteMapping("/delete/{id}")
    public Result delete(@PathVariable Integer id) {
        log.info("删除评论：{}", id);
        userCommentService.delete(id);
        return Result.success();
    }
}
