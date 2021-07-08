--Initial postgres table creation script 
\c rules

DROP TABLE IF EXISTS request_history;
DROP TABLE IF EXISTS data_request;
DROP TABLE IF EXISTS mri_rules; 
DROP TABLE IF EXISTS word_weights; 
DROP TABLE IF EXISTS conjunctions; 
DROP TABLE IF EXISTS spellchecker; 
DROP TABLE IF EXISTS specialty_tags; 
DROP TYPE enum_requests_state;
DROP TYPE enum_history_type;

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

-- Error state is when error string exists, then we can know *when* the error occurred eg during ai priority processing etc
CREATE TYPE enum_requests_state AS ENUM ('received', 'received_duplicate', 'deleted', 'ai_priority_processed', 'final_priority_received', 'labelled');

CREATE TABLE IF NOT EXISTS data_request ( 
    id VARCHAR(36) PRIMARY KEY,
    state enum_requests_state,
    error VARCHAR,
    notes VARCHAR,
    age VARCHAR,    -- current request converted age, hgt, wgt
    height VARCHAR,
    weight VARCHAR,
    request JSON,   -- original request JSON
    info JSON,     -- processed current request data prior sending to Rules engine
    p5_flag BOOLEAN, 
    rules_id INT, 
    phys_priority VARCHAR(3),
    ai_priority VARCHAR(3),
    final_priority VARCHAR(3),
    contrast BOOLEAN,
    tags VARCHAR[],
    phys_contrast BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (rules_id) REFERENCES mri_rules(id)
);

CREATE TYPE enum_history_type AS ENUM ('request', 'modification', 'delete');

CREATE TABLE IF NOT EXISTS request_history ( 
    id SERIAL PRIMARY KEY,
    id_data_request VARCHAR(36),
    history_type enum_history_type,
    description VARCHAR,
    cognito_user_id VARCHAR,
    cognito_user_fullname VARCHAR,
    dob VARCHAR,
    height VARCHAR,
    weight VARCHAR,
    exam_requested VARCHAR,
    reason_for_exam VARCHAR,
    mod_info JSON,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_data_request) REFERENCES data_request(id) ON DELETE CASCADE
);

-- Trigger for data_request
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON data_request
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS word_weights (
    word VARCHAR(32) PRIMARY KEY, 
    weight VARCHAR(1)
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
);

-- SELECT * FROM mri_rules; 
\copy mri_rules(body_part, info, contrast, priority) FROM './src/backend/csv/rules.csv' DELIMITER ',' CSV HEADER;

UPDATE mri_rules 
SET bp_tk = to_tsvector(body_part);

CREATE INDEX info_weighted_idx 
ON mri_rules 
USING GIN (info_weighted_tk);

CREATE INDEX tags_idx
ON data_request
USING GIN(tags);

\copy word_weights FROM './src/backend/csv/wordweights.csv' DELIMITER ',' CSV;

\copy spellchecker FROM './src/backend/csv/spellchecker.csv' DELIMITER ',' CSV;

\copy specialty_tags FROM './src/backend/csv/specialty_exams.csv' DELIMITER ',' CSV;

UPDATE word_weights
SET word = TRIM(word); 

UPDATE spellchecker 
SET word = TRIM(word);

\copy conjunctions FROM './src/backend/csv/conjunctions.csv' DELIMITER ',' CSV;

CREATE TEXT SEARCH DICTIONARY ths_med (
TEMPLATE = thesaurus, 
DictFile = thesaurus_medical,
Dictionary = english_stem); 

CREATE TEXT SEARCH CONFIGURATION ths_search (copy=english); 

ALTER TEXT SEARCH CONFIGURATION ths_search 
ALTER MAPPING FOR asciiword, asciihword, hword_asciipart 
WITH ths_med, english_stem;
