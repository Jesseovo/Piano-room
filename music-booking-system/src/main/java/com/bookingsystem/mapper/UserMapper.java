package com.bookingsystem.mapper;

import com.bookingsystem.dto.UserQueryDTO;
import com.bookingsystem.pojo.User;
import com.bookingsystem.vo.UserQueryVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface UserMapper {
    List<UserQueryVo> list(UserQueryDTO userQueryDTO);

    @Select("select id,username,password, real_name, student_id, email, phone, grade, major, user_type, avatar_url, status, token_version, violation_count, ban_until, last_login_time, last_login_ip, created_at, updated_at from users where id = #{id}")
    User getById(Long id);

    @Update("update users set password = #{newPassword}, token_version = token_version + 1, updated_at = now() where id = #{id}")
    void resetPassword(@Param("id") Long id, @Param("newPassword") String newPassword);

    @Update("update users set password = #{newPassword}, token_version = token_version + 1, updated_at = now() where id = #{id}")
    void migratePassword(@Param("id") Long id, @Param("newPassword") String newPassword);

    void delete(Long[] ids);

    @Update("update users set status = #{status} where id = #{id}")
    void setStatus(Integer status, Long id);


    User selectByUsername(@Param("username") String username);

    @Select("select count(*) from users")
    int getUserNum();

    void update(User user);

    void insert(User user);


    List<UserQueryVo> selectAdmins(UserQueryDTO userQueryDTO);

    @Update("UPDATE users SET violation_count = violation_count + 1, updated_at = NOW() WHERE id = #{userId}")
    void incrementViolationCount(@Param("userId") Long userId);

    @Update("UPDATE users SET ban_until = #{banUntil}, updated_at = NOW() WHERE id = #{userId}")
    void setBanUntil(@Param("userId") Long userId, @Param("banUntil") LocalDateTime banUntil);

    @Update("UPDATE users SET ban_until = NULL, updated_at = NOW() WHERE id = #{userId}")
    void removeBan(@Param("userId") Long userId);

    @Select("SELECT * FROM users WHERE id = #{userId}")
    User getViolationInfo(@Param("userId") Long userId);
}
