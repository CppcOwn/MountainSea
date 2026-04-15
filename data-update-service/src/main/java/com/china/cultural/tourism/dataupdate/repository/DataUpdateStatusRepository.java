package com.china.cultural.tourism.dataupdate.repository;

import com.china.cultural.tourism.dataupdate.entity.DataUpdateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DataUpdateStatusRepository extends JpaRepository<DataUpdateStatus, Long> {
    Optional<DataUpdateStatus> findByDataType(String dataType);
}
