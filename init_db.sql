--Initial postgres table creation script 
\c rules 

DROP TABLE IF EXISTS data_results; 
DROP TABLE IF EXISTS mri_rules; 
DROP TABLE IF EXISTS word_weights; 
DROP TABLE IF EXISTS conjunctions; 
DROP TABLE IF EXISTS spellchecker; 
DROP TABLE IF EXISTS specialty_tags; 

--timestamp function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS mri_rules ( 
    id SERIAL PRIMARY KEY, 
    body_part VARCHAR(32) NOT NULL, 
    bp_tk TSVECTOR, 
    contrast BOOLEAN,
    info TEXT, 
    info_weighted_tk TSVECTOR, 
    priority VARCHAR(3),
    active BOOLEAN DEFAULT TRUE
); 

CREATE TABLE IF NOT EXISTS data_results ( 
    id VARCHAR(36) PRIMARY KEY, 
    info JSON NOT NULL, 
    p5_flag BOOLEAN, 
    rules_id INT, 
    sys_priority VARCHAR(3),
    contrast BOOLEAN,
    tags VARCHAR[],
    phys_priority VARCHAR(3),
    phys_contrast BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (rules_id) REFERENCES mri_rules(id)
); 

-- Trigger for data_results
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON data_results
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS word_weights (
    word VARCHAR(32) PRIMARY KEY, 
    weight VARCHAR(2)
);

CREATE TABLE IF NOT EXISTS conjunctions (
    key VARCHAR(16) PRIMARY KEY, 
    val VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS spellchecker(
    word VARCHAR(32) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS specialty_tags ( 
    tag VARCHAR(32) PRIMARY KEY
)

-- SELECT * FROM mri_rules; 
\copy mri_rules(body_part, info, contrast, priority) FROM '<PROJECT LOCATION>/csv/rules.csv' DELIMITER ',' CSV HEADER;

UPDATE mri_rules 
SET bp_tk = to_tsvector(body_part);

CREATE INDEX info_weighted_idx 
ON mri_rules 
USING GIN (info_weighted_tk);

CREATE INDEX tags_idx
ON data_results
USING GIN(tags);

\copy word_weights FROM '<PROJECT LOCATION>/csv/wordweights.csv' DELIMITER ',' CSV;

\copy spellchecker FROM '<PROJECT LOCATION>/csv/spellchecker.csv' DELIMITER ',' CSV;

\copy specialty_tags FROM '<PROJECT LOCATION>/csv/specialty_exams.csv' DELIMITER ',' CSV;

UPDATE word_weights
SET word = TRIM(word); 

UPDATE spellchecker 
SET word = TRIM(word);

\copy conjunctions FROM '<PROJECT LOCATION>/csv/conjunctions.csv' DELIMITER ',' CSV;
