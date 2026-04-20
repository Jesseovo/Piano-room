package com.bookingsystem.mapper;

import com.bookingsystem.pojo.VerificationCodeRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface VerificationCodeMapper {
    void upsert(VerificationCodeRecord record);

    VerificationCodeRecord selectByBusinessTypeAndVerificationKey(@Param("businessType") String businessType,
                                                                  @Param("verificationKey") String verificationKey);

    void consume(@Param("businessType") String businessType, @Param("verificationKey") String verificationKey);

    void deleteExpiredCodes();
}
