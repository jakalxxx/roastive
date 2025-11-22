-- Align column type with JPA expectation: VARCHAR(4)
ALTER TABLE roastery_site
  ALTER COLUMN branch_seq_no TYPE varchar(4) USING trim(branch_seq_no);


