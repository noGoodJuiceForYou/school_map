package com.map.exception;

import com.map.pojo.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler
    public Result handlerException(Exception e) {
        log.error("服务器发生异常", e);
        return Result.error("服务器发生异常");
    }

    @ExceptionHandler
    public Result handlerDuplicateKeyException(DuplicateKeyException e){
        log.error("服务器发生异常", e);
        String message = e.getMessage();
        int i = message.indexOf("Duplicate entry");
        String errMsg = message.substring(i);
        String[] arr = errMsg.split(" ");
        return Result.error(arr[2] + "已存在");
    }

}
