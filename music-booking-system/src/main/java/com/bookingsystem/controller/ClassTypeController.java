package com.bookingsystem.controller;

import com.bookingsystem.annotation.PublicAccess;
import com.bookingsystem.annotation.RequireRoles;
import com.bookingsystem.pojo.ClassType;
import com.bookingsystem.pojo.Result;
import com.bookingsystem.service.ClassTypeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/classType")
public class ClassTypeController {

    @Autowired
    private ClassTypeService classTypeService;

    @PublicAccess
    @GetMapping("/all")
    public Result getAll(){
      List<ClassType> res =   classTypeService.list();
      return Result.success(res);
    }

    /**
     * 添加教室类型
     * @param classType
     * @return
     */
    @RequireRoles({"admin", "super_admin"})
    @PostMapping
    public Result addClassType(@RequestBody ClassType classType) {
        boolean success = classTypeService.addClassType(classType);
        return success ? Result.success() : Result.error("Failed to add class type");
    }

    /**
     * 删除教室类型
     * @param id
     * @return
     */
    @RequireRoles({"admin", "super_admin"})
    @DeleteMapping("/{id}")
    public Result deleteClassType(@PathVariable Long id) {
        boolean success = classTypeService.deleteClassType(id);
        return success ? Result.success() : Result.error("该教室类型下面关联了其他教室请先删除其他教室在执行此操作！");
    }

    /**
     * 更新教室类型
     * @param id
     * @param classType
     * @return
     */
    @RequireRoles({"admin", "super_admin"})
    @PutMapping("/{id}")
    public Result updateClassType(@PathVariable Long id, @RequestBody ClassType classType) {
        boolean success = classTypeService.updateClassType(id, classType);
        return success ? Result.success() : Result.error("Failed to update class type");
    }

    /**
     * 获取所有教室类型
     * @return
     */
    @PublicAccess
    @GetMapping
    public Result getAllClassTypes(@RequestParam(defaultValue = "1") Integer pageNum,
                                   @RequestParam (defaultValue = "10") Integer pageSize,
                                   @RequestParam (required = false) String typeName) {
        return Result.success( classTypeService.getAllClassTypes(pageNum, pageSize, typeName));
    }

    /**
     * 根据ID获取教室类型
     * @param id
     * @return
     */
    @PublicAccess
    @GetMapping("/{id}")
    public Result getClassTypeById(@PathVariable Long id) {
        ClassType classType = classTypeService.getClassTypeById(id);
        return classType != null ? Result.success(classType) : Result.error("Class type not found");
    }
}
