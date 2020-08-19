--Initial postgres table creation script 
\c rules 

DROP TABLE IF EXISTS data_results; 
DROP TABLE IF EXISTS mri_rules; 
DROP TABLE IF EXISTS word_weights; 
DROP TABLE IF EXISTS conjunctions; 
DROP TABLE IF EXISTS spellchecker; 

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
    arthro BOOLEAN DEFAULT FALSE,
    info TEXT, 
    info_weighted_tk TSVECTOR, 
    priority VARCHAR(3),
    active BOOLEAN DEFAULT TRUE,
    UNIQUE (body_part, info)
); 

CREATE TABLE IF NOT EXISTS data_results ( 
    id VARCHAR(36) PRIMARY KEY, 
    info JSON NOT NULL, 
    rules_id INT, 
    sys_priority VARCHAR(3),
    contrast BOOLEAN,
    arthro BOOLEAN, 
    p5_check BOOLEAN, 
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
    weight VARCHAR(1)
);

CREATE TABLE IF NOT EXISTS conjunctions (
    key VARCHAR(16) PRIMARY KEY, 
    val VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS spellchecker(
    word VARCHAR(32) PRIMARY KEY
);

-- SELECT * FROM mri_rules; 

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES 
('abdomen', 'Abscesses', 'P3', TRUE),
('abdomen', 'Adrenal mass', 'P3', TRUE),
('abdomen', 'Aneurysm (Brain and Angio)', 'P4', TRUE),
('abdomen', 'Appendix', 'P2', FALSE),
('abdomen', 'Bowel ischemia (SBFT)', 'P2', TRUE),
('abdomen', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3', TRUE),
('abdomen', 'Hepatic mass (likely hemangioma FNH)', 'P3', TRUE),
('abdomen', 'Lesions', 'P3', TRUE),
('abdomen', 'Liver Cancer staging of new (FU timed or RT)', 'P3', TRUE),
('abdomen', 'Lymphoma query', 'P3', TRUE),
('abdomen', 'Metastatic workup rad to decide', 'P3', TRUE),
('abdomen', 'MRCP (query ca P3, NYD pain 4)', 'P3', TRUE),
('abdomen', 'MRCP known', 'P4', TRUE),
('abdomen', 'Pancreas Cancer (rad review)', 'P3', TRUE),
('abdomen', 'Portal vein Thrombosis', 'RAD', TRUE),
('abdomen', 'Renal Cancer followup', 'P4', TRUE),
('abdomen', 'Renal Artery Stenosis', 'P4', TRUE),
('abdomen', 'Renal Cancer Query is semi', 'P3', TRUE),
('abdomen', 'SBFT  Chrohns (unless clinically Warrants sooner)', 'P4', TRUE),
('abdomen', 'Staging of new cancer', 'P3', FALSE),
('abdomen', 'Vascular abnormalities (medical history needed)', 'P3', TRUE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES 
('angio', 'Acute carotid or aortic dissection (CT equivocal)', 'P1', TRUE),
('angio', 'Critical / high grade ICA stenosis symptom', 'P2', TRUE),
('angio', 'Glomus Tumor Carotids', 'P3', TRUE),
('angio', 'MRA vascular rest pain, Claudication', 'P2', TRUE),
('angio', 'MRA vascular gangrene', 'P1', TRUE),
('angio', 'Preoperative assessment of renal vascular invasion by renal cell carcinoma if ultrasound or CT is inconclusive', 'P2', TRUE),
('angio', 'Suspected intracranial vascular lesion', 'P2', TRUE),
('angio', 'Renal artery stenosis', 'P4', TRUE),
('angio', 'Screen Circle of Willis', 'P4', FALSE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES 
('aortic arch and branches', 'Aneurysm (confirmed, enlarging, Preop) Followup Routine)', 'RAD', TRUE),
('aortic arch and branches', 'Aneurysm', 'P3', TRUE),
('aortic arch and branches', 'Coarctation', 'RAD', TRUE),
('aortic arch and branches', 'Vascular Abnormalities', 'RAD', TRUE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES 
('brain / head', 'Acoustic neuroma Known', 'P4', TRUE),
('brain / head', 'Acoustic neuroma Query ',  'P3', FALSE),
('brain / head', 'Acute stroke (CT preferred as initial investigation)',  'P1', FALSE),
('brain / head', 'Aneurysm (Initial)', 'P3', FALSE),
('brain / head', 'Aneurysm (followup or screening)', 'P4', FALSE),
('brain / head', 'Any acute hydrocephalus if MRI needed for RX planning (i.e. ventriculostomy)', 'P1', FALSE),
('brain / head', 'Arachnoid cyst ', 'P4', FALSE),
('brain / head', 'Arachnoiditis', 'P3', TRUE),
('brain / head', 'Arteriovenous malformation', 'P3', TRUE),
('brain / head', 'Arteriovenous malformation (followup)', 'P4', TRUE),
('brain / head', 'Asymmetric sensorineural hearing loss', 'P4', FALSE),
('brain / head', 'Ataxic gait', 'P4', FALSE),
('brain / head', 'Cavernous Malformations (Screen or followup)', 'P4', FALSE),
('brain / head', 'Characterization soft tissue mass likely benign (lipoma)', 'P3', TRUE),
('brain / head', 'Cognitive change', 'P4', FALSE),
('brain / head', 'Congenital brain/spine abnormality which is symptomatic', 'P3', FALSE),
('brain / head', 'Demyelination (like MS)', 'P3', FALSE),
('brain / head', 'Demyelination (like MS, diagnosis)', 'P3', FALSE),
('brain / head', 'Grand Mal Seizures, History of', 'P4', FALSE),
('brain / head', 'Grand Mal Seizures, New ', 'P4', FALSE),
('brain / head', 'Head venogram query new clot benign intracranial hypertention (Tech or Rad review)', 'P2', TRUE),
('brain / head', 'Increased Prolactin level PIT)', 'P3', TRUE),
('brain / head', 'Intracranial hemorrhageassessment of underlying lesion', 'P1', FALSE),
('brain / head', 'Intracranial neoplasm further delineation of lesion seen on CT, or exclusion of additional metastatic lesion when surgery not immediately contemplated', 'P2', TRUE),
('brain / head', 'Ischemic optic Neuropathy', 'P3', FALSE),
('brain / head', 'Know Chiari malformations', 'P4', FALSE),
('brain / head', 'Know Chiari malformations with surgical decompressions (surgical work up P3)', 'P3', FALSE),
('brain / head', 'Meningioma Followup', 'P4', TRUE),
('brain / head', 'Meningioma initial workup', 'P3', TRUE),
('brain / head', 'Metastatic workup', 'P3', TRUE),
('brain / head', 'MS Followup known, Query new lesion', 'P4', FALSE),
('brain / head', 'MS Rule out PML', 'P3', FALSE),
('brain / head', 'MS Initial diagnosis', 'P3', FALSE),
('brain / head', 'Neurodegenerative/ dementia', 'P4', FALSE),
('brain / head', 'Neurofibroma ', 'P3', TRUE),
('brain / head', 'Optic Atrophy', 'P3', FALSE),
('brain / head', 'Optic Neuritis or Neuropathy', 'P3', FALSE),
('brain / head', 'Orbital Lesion', 'P3', TRUE),
('brain / head', 'Pituitary adenoma suspected', 'P3', TRUE),
('brain / head', 'Post concussion syndrome', 'P4', FALSE),
('brain / head', 'Preoperative evaluation of posterior fossa neoplasm, deep supratentorial neoplam, or exclusion of additional metastatic lesions, if CT does not answer these questions.', 'P1', TRUE),
('brain / head', 'Pulsatile tinnitus or tinnitus ', 'P4', FALSE),
('brain / head', 'Retrocochlear disease', 'P4', FALSE),
('brain / head', 'Seizures (followup)', 'P4', FALSE),
('brain / head', 'Seizures NEW symptoms', 'P3', FALSE),
('brain / head', 'Skull base and nasopharyngeal tumours for further localizaton and surgical planning', 'P3', TRUE),
('brain / head', 'Skull base and nasopharyngeal tumours for further localizaton and surgical planning (if tumor invading ASAP Priority 2)', 'P2', TRUE),
('brain / head', 'Space occupying lesion (SOL) Known', 'P3', TRUE),
('brain / head', 'Staging of new cancer', 'P3', FALSE),
('brain / head', 'Stealth (coordinated with OR date)', 'RAD', TRUE),
('brain / head', 'Suspected encephalitis or abscess', 'P1', TRUE),
('brain / head', 'Suspected intracranial lesion (medical history)', 'P3', FALSE),
('brain / head', 'Suspected intracranial lesion', 'P4', FALSE),
('brain / head', 'Suspected intracranial venous thrombosis if CTA unavailable or unable to be performed', 'RAD', TRUE),
('brain / head', 'TMJ RJH only', 'P4', FALSE),
('brain / head', 'TMJ (locked then semi urgent P3) RJH only', 'P3', FALSE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES 
('breast', 'Breast implants Usually looking for a leak', 'P4', TRUE),
('breast', 'Breast residual / recurrent disease post Tx','P3', TRUE),
('breast', 'Characterization soft tissue mass likely benign (lipoma)', 'P3', TRUE),
('breast', 'Metastatic workup', 'P3', TRUE),
('breast', 'Workup of new breast carcinoma', 'P2', TRUE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES 
('cardiac', 'cardiac ARVD', 'P3', TRUE),
('cardiac', 'cardiac viability assessment or mass', 'P2', TRUE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES 
('chest', 'Characterization soft tissue masslikely benign (lipoma)', 'P3', TRUE),
('chest', 'Metastatic workup', 'P3', TRUE),
('chest', 'Pancoast tumour', 'P3', TRUE),
('chest', 'Preoperative assessment of possible mediastinal or chest wall invasion by tumour, CT is inconclusive', 'RAD', TRUE),
('chest', 'Preoperative assessment of possible mediastinal or chest wall invasion by tumour', 'P2', TRUE),
('chest', 'Staging of new cancer','P3', TRUE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES 
('neck', 'Characterization soft tissue masslikely benign (lipoma)', 'P3', TRUE),
('neck', 'Metastatic workup', 'P3', TRUE),
('neck', 'Skull base and nasopharyngeal tumours, for further localization and surgical planning', 'P2', TRUE),
('neck', 'Staging of new cancer (thyroid)', 'P3', TRUE),
('neck / spine', 'Sciatica / radiculopathy', 'P4', FALSE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES 
('pelvis', 'Anal Fistula', 'P4', FALSE), 
('pelvis', 'Cervical cancer followup', 'P4', TRUE), 
('pelvis', 'Cervix Cancer staging', 'P3', FALSE), 
('pelvis', 'Fetal abnormality', 'P2', FALSE),
('pelvis', 'Fibroids', 'P4', FALSE), 
('pelvis', 'Inguinal Hernia', 'RAD', FALSE),
('pelvis', 'Metastatic workup', 'P3', TRUE),
('pelvis', 'Post UAE (uterine Artery Emblization)', 'RAD', TRUE),
('pelvis', 'Prostate CA', 'P3', TRUE), 
('pelvis', 'Rectal carcinoma new diagnosis', 'P2', TRUE), 
('pelvis', 'Rectal carcinoma staging', 'P2', FALSE),
('pelvis', 'Rule out Seminoma (met)', 'P3', TRUE), 
('pelvis', 'Staging of new cancer', 'P3', TRUE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES
('spine', 'Acute osteomyelitis', 'P1', FALSE), 
('spine', 'Characterization soft tissue masslikely benign (lipoma)', 'P3', TRUE), 
('spine', 'Chronic osteomyelitis', 'P2', FALSE), 
('spine', 'Chronic spine pain', 'P4', FALSE), 
('spine', 'Evaluation of spinal cord injury in acute trauma if no bony abnormality is noted, to assess cord injury of compression', 'P1', FALSE), 
('spine', 'Foot Drop', 'P3', FALSE),
('spine', 'Foot Drop query Tumor', 'P2', TRUE), 
('spine', 'Metastatic workup', 'P3', TRUE), 
('spine', 'Myelopathy', 'P2', FALSE), 
('spine', 'Neurofibroma', 'P3', TRUE),
('spine', 'Neurofibromatosis (followup)', 'P4', TRUE), 
('spine', 'Preoperative evaluation of spinal cord neoplasm', 'P1', TRUE), 
('spine', 'Staging of new cancer', 'P3', TRUE), 
('spine', 'Sciatica / radiculopathy', 'P4', FALSE), 
('spine', 'SI joints (rheumatology referral only)', 'P4', FALSE),
('spine', 'Spinal Stenosis (ordered by ortho)','P3', FALSE),
('spine', 'Spinal Stenosis (ordered by GP)', 'P4', FALSE),
('spine', 'spine Lesion', 'P3', TRUE), 
('spine', 'spine Query cord impingement', 'P2', FALSE), 
('spine', 'spine root compression poss mass', 'P3', TRUE), 
('spine', 'Suspicion of spinal osteomyelitis', 'P2', TRUE), 
('spine', 'Syrinx (query)', 'P3', FALSE),
('spine', 'Syrinx (followup)', 'P4', FALSE), 
('spine', 'Urinary / bowel incontinence, HX that goes along with a Lumbar spine', 'P2', FALSE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES
('knee', 'ACL Tear (ortho ordered surigical)', 'P2', FALSE), 
('knee', 'ACL Tear (GP)', 'P4', FALSE),
('knee', 'Acute joint injury tendon rupture', 'P2', FALSE),
('knee', 'Acute osteomyelitis', 'P1', FALSE),
('knee', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3', TRUE),
('knee', 'Chronic joint pain', 'P4', FALSE),
('knee', 'Chronic Osteomyelitis', 'P2', TRUE),
('knee', 'GP knee, acute (new injury)', 'P3', FALSE), 
('knee', 'GP knee, chronic HX or meniscal tear (not new injury)', 'P4', FALSE), 
('knee', 'Impingement', 'P4', FALSE), 
('knee', 'Joint Injury', 'P4', FALSE),
('knee', 'Locked knee (GP or specialist)', 'P3', FALSE), 
('knee', 'Metastatic workup', 'P3', TRUE), 
('knee', 'Orthopedic knee, acute', 'P3', FALSE), 
('knee', 'Orthopedic knee, chronic', 'P3', FALSE), 
('knee', 'Orthopedic knee', 'P3', TRUE), 
('knee', 'Osteochondromas (unless concern clinically)', 'P4', FALSE), 
('knee', 'Primary sarcoma of bone or soft tissue', 'P2', TRUE), 
('knee', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2', FALSE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES
('hip', 'Acute joint injury tendon rupture', 'P2', FALSE),
('hip', 'Acute osteomyelitis', 'P1', TRUE),
('hip', 'Brachail plexus', 'P4', FALSE),
('hip', 'Brachail plexus query tumor', 'P4', TRUE),
('hip', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3', TRUE),
('hip', 'Chronic joint pain', 'P4', FALSE),
('hip', 'Chronic Osteomyelitis', 'P2', TRUE),
('hip', 'Hip Query labral tear (arthrogram)', 'P4', TRUE),
('hip', 'Joint Injury', 'P4', FALSE),
('hip', 'Labral tear query (arthrogram)', 'P4', TRUE),
('hip', 'Metastatic workup', 'P3', TRUE), 
('hip', 'Primary sarcoma of bone or soft tissue', 'P2', TRUE), 
('hip', 'R/O occult fractures from ER: Hip', 'P2', FALSE), 
('hip', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2', FALSE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES
('shoulder', 'Acute joint injury tendon rupture', 'P2', FALSE),
('shoulder', 'Acute osteomyelitis', 'P1', TRUE),
('shoulder', 'Brachial plexus', 'P4', FALSE),
('shoulder', 'Brachial plexus query tumor', 'P4', TRUE),
('shoulder', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3', TRUE),
('shoulder', 'Chronic joint pain', 'P4', FALSE),
('shoulder', 'Chronic Osteomyelitis', 'P2', TRUE),
('shoulder', 'Impingement', 'P4', FALSE),
('shoulder', 'Joint Injury (ie. labrum)', 'P4', FALSE),
('shoulder', 'Labral tear query (arthrogram)', 'P4', TRUE),
('shoulder', 'Metastatic workup', 'P3', TRUE), 
('shoulder', 'Primary sarcoma of bone or soft tissue', 'P2', TRUE), 
('shoulder', 'Rotator cuff query tear', 'P3', FALSE), 
('shoulder', 'SLAP tear Query (arthrogram)', 'P4', TRUE), 
('shoulder', 'Supraspinatus tendon', 'P4', FALSE), 
('shoulder', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2', FALSE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES
('wrist / hand', 'Acute joint injury tendon rupture', 'P2', FALSE),
('wrist / hand', 'Acute osteomyelitis', 'P1', TRUE),
('wrist / hand', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3', TRUE),
('wrist / hand', 'Chronic joint pain', 'P4', FALSE),
('wrist / hand', 'Chronic Osteomyelitis', 'P2', TRUE),
('wrist / hand', 'Joint Injury', 'P4', FALSE),
('wrist / hand', 'Metastatic workup', 'P3', TRUE), 
('wrist / hand', 'Primary sarcoma of bone or soft tissue', 'P2', TRUE), 
('wrist / hand', 'R/O occult fractures from ER: scaphoid', 'P2', FALSE), 
('wrist / hand', 'TFCC (Traingular fibrocartilage complex) wrist tear','P4', FALSE), 
('wrist / hand', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2', FALSE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES
('foot', 'Acute joint injury tendon rupture', 'P2', FALSE),
('foot', 'Acute osteomyelitis', 'P1', TRUE),
('foot', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3', TRUE),
('foot', 'Chronic joint pain', 'P4', FALSE),
('foot', 'Chronic Osteomyelitis', 'P2', TRUE),
('foot', 'Foot Query Mortens Neuroma', 'P4', FALSE),
('foot', 'Joint Injury','P4', FALSE),
('foot', 'Metastatic workup', 'P3', TRUE), 
('foot', 'Primary sarcoma of bone or soft tissue', 'P2', TRUE), 
('foot', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2', FALSE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES
('c-spine', 'Acute joint injury tendon rupture', 'P2', FALSE),
('c-spine', 'Acute osteomyelitis', 'P1', TRUE),
('c-spine', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3', TRUE),
('c-spine', 'Chronic joint pain', 'P4', FALSE),
('c-spine', 'Chronic Osteomyelitis', 'P2', TRUE),
('c-spine', 'Brachial plexus', 'P4', FALSE),
('c-spine', 'Brachial plexus query tumor', 'P4', TRUE),
('c-spine', 'Joint Injury', 'P4', FALSE),
('c-spine', 'Metastatic workup', 'P3', TRUE), 
('c-spine', 'Primary sarcoma of bone or soft tissue', 'P2', TRUE), 
('c-spine', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2', FALSE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES
('elbow', 'Acute joint injury tendon rupture', 'P2', FALSE),
('elbow', 'Acute osteomyelitis', 'P1', TRUE),
('elbow', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3', TRUE),
('elbow', 'Chronic joint pain', 'P4', FALSE),
('elbow', 'Chronic Osteomyelitis', 'P2', TRUE),
('elbow', 'Joint Injury', 'P4', FALSE),
('elbow', 'Metastatic workup', 'P3', TRUE), 
('elbow', 'Primary sarcoma of bone or soft tissue', 'P2', TRUE), 
('elbow', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2', FALSE);

INSERT INTO mri_rules(body_part, info, priority, contrast) VALUES
('ankle', 'Acute joint injury/tendon rupture', 'P2', FALSE),
('ankle', 'Acute osteomyelitis', 'P1', TRUE),
('ankle', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3', TRUE),
('ankle', 'Chronic joint pain', 'P4', FALSE),
('ankle', 'Chronic Osteomyelitis', 'P2', TRUE),
('ankle', 'Joint Injury', 'P4', FALSE),
('ankle', 'Metastatic workup', 'P3', TRUE), 
('ankle', 'Primary sarcoma of bone or soft tissue', 'P2', TRUE), 
('ankle', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2', FALSE);

UPDATE mri_rules 
SET bp_tk = to_tsvector(body_part);

UPDATE mri_rules 
SET arthro = TRUE 
WHERE info LIKE '%arthrogram%';

\copy word_weights FROM 'C:\Users\jackhou\Documents\mri_project\mri_app\csv\wordweights.csv' DELIMITER ',' CSV;

\copy spellchecker FROM 'C:\Users\jackhou\Documents\mri_project\mri_app\csv\spellchecker.csv' DELIMITER ',' CSV; 

UPDATE word_weights
SET word = TRIM(word); 

CREATE INDEX info_weighted_idx 
ON mri_rules 
USING GIN (info_weighted_tk);

\copy conjunctions FROM 'C:\Users\jackhou\Documents\mri_project\mri_app\csv\conjunctions.csv' DELIMITER ',' CSV;
