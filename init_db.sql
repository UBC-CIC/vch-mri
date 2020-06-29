--Initial postgres table creation script 
\c rules 

DROP TABLE IF EXISTS data_results; 
DROP TABLE IF EXISTS mri_rules; 
DROP TABLE IF EXISTS word_weights; 

CREATE TABLE IF NOT EXISTS mri_rules ( 
    id SERIAL PRIMARY KEY, 
    body_part VARCHAR(32) NOT NULL, 
    bp_tk TSVECTOR, 
    info TEXT, 
    info_weighted_tk TSVECTOR, 
    priority VARCHAR(3),
    dateModified TIMESTAMP
); 

CREATE TABLE IF NOT EXISTS data_results ( 
    id INT PRIMARY KEY, 
    init_priority VARCHAR(3),
    info JSON NOT NULL, 
    rules_id INT, 
    sys_priority VARCHAR(3),
    contrast BOOLEAN,
    phys_priority VARCHAR(3),
    phys_contrast BOOLEAN,
    FOREIGN KEY (rules_id) REFERENCES mri_rules(id)
); 

CREATE TABLE IF NOT EXISTS word_weights (
    word VARCHAR(32) PRIMARY KEY, 
    weight VARCHAR(1)
);

-- SELECT * FROM mri_rules; 

INSERT INTO mri_rules(body_part, info, priority) VALUES 
('abdomen', 'Abscesses', 'P3A'),
('abdomen', 'Adrenal mass', 'P3B'),
('abdomen', 'Aneurysm (Brain and Angio)', 'P4'),
('abdomen', 'Appendix', 'P2'),
('abdomen', 'Bowel ischemia (SBFT)', 'P2'),
('abdomen', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3B'),
('abdomen', 'Hepatic mass (likely hemangioma FNH)', 'P3B'),
('abdomen', 'Lesions', 'P3A'),
('abdomen', 'Liver Cancer staging of new (FU timed or RT)', 'P3A'),
('abdomen', 'Lymphoma query', 'P3A'),
('abdomen', 'Metastatic workup rad to decide', 'P3A'),
('abdomen', 'MRCP (query ca P3A, NYD pain 4)', 'P3A'),
('abdomen', 'MRCP known', 'P4'),
('abdomen', 'Pancreas Cancer (rad review)', 'P3A'),
('abdomen', 'Portal vein Thrombosis', 'RAD'),
('abdomen', 'Renal Cancer  Follow up', 'P4'),
('abdomen', 'Renal Artery Stenosis', 'P4'),
('abdomen', 'Renal Cancer Query is semi', 'P3B'),
('abdomen', 'SBFT  Chrohns (unless clinically Warrants sooner)', 'P4'),
('abdomen', 'Staging of new cancer', 'P3A');

INSERT INTO mri_rules(body_part, info, priority) VALUES 
('angio', 'Acute carotid or aortic dissection (CT equivocal)', 'P1'),
('angio', 'Critical / high grade ICA stenosis symptom', 'P2'),
('angio', 'Glomus Tumor Carotids', 'P3C'),
('angio', 'MRA vascular rest pain, Claudication', 'P2'),
('angio', 'MRA vascular gangrene', 'P1'),
('angio', 'Preoperative assessment of renal vascular invasion by renal cell carcinoma if ultrasound or CT is inconclusive', 'P2'),
('angio', 'Suspected intracranial vascular lesion', 'P2'),
('angio', 'Renal artery stenosis', 'P4'),
('angio', 'Screen Circle of Willis', 'P4');

INSERT INTO mri_rules(body_part, info, priority) VALUES 
('aortic arch and branches', 'Aneurysm (confirmed, enlarging, Preop) F/U Routine)', 'RAD'),
('aortic arch and branches', 'Coarctation', 'RAD'),
('aortic arch and branches', 'Vascular Abnormalities', 'RAD');

INSERT INTO mri_rules(body_part, info, priority) VALUES 
('brain / head', 'Acoustic neuroma Known', 'P4'),
('brain / head', 'Acoustic neuroma Query ',  'P3C'),
('brain / head', 'Acute stroke (CT preferred as initial investigation)',  'P1'),
('brain / head', 'Aneurysm (Initial)', 'P3A'),
('brain / head', 'Aneurysm (F/U or screening)', 'P4'),
('brain / head', 'Any acute hydrocephalus if MRI needed for RX planning (i.e. ventriculostomy)', 'P1'),
('brain / head', 'Arachnoid cyst ', 'P4'),
('brain / head', 'Arachnoiditis', 'P3A'),
('brain / head', 'Arteriovenus malformation (known P3A/Screen)', 'P3A'),
('brain / head', 'Arteriovenus malformation (f/u)', 'P4'),
('brain / head', 'Asymmetric sensorineural hearing loss', 'P4'),
('brain / head', 'Ataxic gait', 'P4'),
('brain / head', 'Cavernous Malformations (Screen or f/u)', 'P4'),
('brain / head', 'Characterization soft tissue mass likely benign (lipoma)', 'P3B'),
('brain / head', 'Cognitive change', 'P4'),
('brain / head', 'Congenital brain/spine abnormality which is symptomatic', 'P3C'),
('brain / head', 'Demyelination (like MS)', 'P3C'),
('brain / head', 'Demyelination (like MS, diagnosis)', 'P3A'),
('brain / head', 'Grand Mal Seizures, History of', 'P4'),
('brain / head', 'Grand Mal Seizures, New ', 'P4'),
('brain / head', 'Head venogram ? new clot benign intracranial hypertention (Tech/Rad review)', 'P2'),
('brain / head', 'Increased Prolactin level PIT)', 'P3C'),
('brain / head', 'Intracranial hemorrhageassessment of underlying lesion', 'P1'),
('brain / head', 'Ischemic optic Neuropathy', 'P3C'),
('brain / head', 'Know Chiari malformations', 'P4'),
('brain / head', 'Know Chiari malformations with surgical decompressions (surgical work up P3A)', 'P3A'),
('brain / head', 'Meningioma Follow up', 'P4'),
('brain / head', 'Meningioma initial workup', 'P3B'),
('brain / head', 'Metastatic workup', 'P3A'),
('brain / head', 'MS Follow up known, ? Query new lesion', 'P4'),
('brain / head', 'MS Rule out PML', 'P3B'),
('brain / head', 'MS Initial diagnosis', 'P3B'),
('brain / head', 'Neurodegenerative/ dementia', 'P4'),
('brain / head', 'Neurofibroma ', 'P3C'),
('brain / head', 'Optic Atrophy', 'P3C'),
('brain / head', 'Optic Neuritis or Neuropathy', 'P3C'),
('brain / head', 'Orbital Lesion', 'P3A'),
('brain / head', 'Pituitary adenoma suspected', 'P3B'),
('brain / head', 'Post concussion syndrome', 'P4'),
('brain / head', 'Preoperative evaluation of posterior fossa neoplasm, deep supratentorial neoplam, or exclusion of additional metastatic lesions, if CT does not answer these questions.', 'P1'),
('brain / head', 'Pulsatile tinnitus or tinnitus ', 'P4'),
('brain / head', 'Retrocochlear disease', 'P4'),
('brain / head', 'Seizures (followup)', 'P4'),
('brain / head', 'Seizures NEW symptoms', 'P3A'),
('brain / head', 'Skull base and nasopharyngeal tumours for further localizaton and surgical planning', 'P3A'),
('brain / head', 'Skull base and nasopharyngeal tumours for further localizaton and surgical planning (if tumor invading ASAP Priority 2)', 'P2'),
('brain / head', 'Space occupying lesion (SOL) Known', 'P3A'),
('brain / head', 'Staging of new cancer', 'P3A'),
('brain / head', 'Stealth (coordinated with OR date)', 'RAD'),
('brain / head', 'Suspected encephalitis or abscess', 'P1'),
('brain / head', 'Suspected intracranial lesion (hx)( Rule out 4)', 'P3A'),
('brain / head', 'Suspected intracranial lesion', 'P4'),
('brain / head', 'Suspected intracranial venous thrombosis if CTA unavailable or unable to be performed', 'RAD'),
('brain / head', 'TMJ RJH only', 'P4'),
('brain / head', 'TMJ (lockedthen semi urgent P3A) RJH only', 'P3A');

INSERT INTO mri_rules(body_part, info, priority) VALUES 
('breast', 'Breast implants Usually looking for a leak', 'P4'),
('breast', 'Breast residual/recurrent disease post Tx','P3A'),
('breast', 'Characterization soft tissue mass likely benign (lipoma)', 'P3B'),
('breast', 'Metastatic workup', 'P3A'),
('breast', 'Workup of new breast carcinoma', 'P2');

INSERT INTO mri_rules(body_part, info, priority) VALUES 
('cardiac', 'cardiac ARVD', 'P2'),
('cardiac', 'cardiac viability assessment or mass', 'P2');

INSERT INTO mri_rules(body_part, info, priority) VALUES 
('chest', 'Characterization soft tissue masslikely benign (lipoma)', 'P3B'),
('chest', 'Metastatic workup', 'P3A'),
('chest', 'Pancoast tumour', 'P3A'),
('chest', 'Preoperative assessment of possible mediastinal or chest wall invasion by tumour, CT is inconclusive', 'RAD'),
('chest', 'Preoperative assessment of possible mediastinal or chest wall invasion by tumour', 'P2'),
('chest', 'Staging of new cancer','P3A');

INSERT INTO mri_rules(body_part, info, priority) VALUES 
('neck', 'Characterization soft tissue masslikely benign (lipoma)', 'P3B'),
('neck', 'Metastatic workup', 'P3A'),
('neck', 'Skull base and nasopharyngeal tumours, for further localization and surgical planning', 'P2'),
('neck', 'Staging of new cancer (thyroid)', 'P3A');

INSERT INTO mri_rules(body_part, info, priority) VALUES 
('pelvis', 'Anal Fistula', 'P4'), 
('pelvis', 'Cervical cancer follow up', 'P4'), 
('pelvis', 'Cervix Cancer staging', 'P3A'), 
('pelvis', 'Fetal abnormality', 'P3A'),
('pelvis', 'Fibroids', 'P4'), 
('pelvis', 'Inguinal Hernia', 'RAD'),
('pelvis', 'Metastatic workup', 'P3A'),
('pelvis', 'Post UAE (uterine Artery Emblization)', 'RAD'),
('pelvis', 'Prostate CA', 'P3B'), 
('pelvis', 'Rectal carcinoma new diagnosis or staging', 'P2'), 
('pelvis', 'Rule out Seminoma (met)', 'P3A'), 
('pelvis', 'Staging of new cancer', 'P3A');

INSERT INTO mri_rules(body_part, info, priority) VALUES
('spine', 'Acute osteomyelitis', 'P1'), 
('spine', 'Characterization soft tissue masslikely benign (lipoma)', 'P3B'), 
('spine', 'Chronic osteomyelitis', 'P2'), 
('spine', 'Chronic spine pain', 'P4'), 
('spine', 'Evaluation of spinal cord injury in acute trauma if no bony abnormality is noted, to assess cord injury of compression', 'P1'), 
('spine', 'Foot Drop', 'P3A'),
('spine', 'Foot Drop query Tumor', 'P2'), 
('spine', 'Metastatic workup', 'P3A'), 
('spine', 'Myelopathy', 'P2'), 
('spine', 'Neurofibroma', 'P3A'),
('spine', 'Neurofibromatosis (follow up)', 'P4'), 
('spine', 'Preoperative evaluation of spinal cord neoplasm', 'P1'), 
('spine', 'Staging of new cancer', 'P3A'), 
('spine', 'Sciatica /radiculopathy', 'P4'), 
('spine', 'SI joints (rheumatology referral only)', 'P4'),
('spine', 'Spinal Stenosis (ordered by ortho)','P3A'),
('spine', 'Spinal Stenosis (ordered by GP)', 'P4'),
('spine', 'spine Lesion', 'P3A'), 
('spine', 'spine Query cord impingement', 'P2'), 
('spine', 'spine root compression poss mass', 'P3A'), 
('spine', 'Suspicion of spinal osteomyelitis', 'P2'), 
('spine', 'Syrinx (query)', 'P3B'),
('spine', 'Syrinx (follow up)', 'P4'), 
('spine', 'Urinary / bowel incontinence, HX that goes along with a Lumbar spine', 'P2');

INSERT INTO mri_rules(body_part, info, priority) VALUES
('knee', 'ACL Tear (ortho ordered surigical)', 'P2'), 
('knee', 'ACL Tear (GP)', 'P4'),
('knee', 'Acute joint injury tendon rupture', 'P2'),
('knee', 'Acute osteomyelitis', 'P1'),
('knee', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3B'),
('knee', 'Chronic joint pain', 'P4'),
('knee', 'Chronic Osteomyelitis', 'P2'),
('knee', 'GP knee, acute (new injury)', 'P3C'), 
('knee', 'GP knee, chronic HX or meniscal tear (not new injury)', 'P4'), 
('knee', 'Impingement', 'P4'), 
('knee', 'Joint Injury', 'P4'),
('knee', 'Locked knee (GP or specialist)', 'P3A'), 
('knee', 'Metastatic workup', 'P3A'), 
('knee', 'Orthopedic knee, acute', 'P3B'), 
('knee', 'Orthopedic knee, chronic', 'P3C'), 
('knee', 'Orthopedic knee', 'P3A'), 
('knee', 'Osteochondromas (unless concern clinically)', 'P4'), 
('knee', 'Primary sarcoma of bone or soft tissue', 'P2'), 
('knee', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2');

INSERT INTO mri_rules(body_part, info, priority) VALUES
('hip', 'Acute joint injury tendon rupture', 'P2'),
('hip', 'Acute osteomyelitis', 'P1'),
('hip', 'Brachail plexus', 'P4'),
('hip', 'Brachail plexus query tumor', 'P4'),
('hip', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3B'),
('hip', 'Chronic joint pain', 'P4'),
('hip', 'Chronic Osteomyelitis', 'P2'),
('hip', 'Hip Querym labral tear (arthrogram)', 'P4'),
('hip', 'Joint Injury', 'P4'),
('hip', 'Labral tear query', 'P4'),
('hip', 'Metastatic workup', 'P3A'), 
('hip', 'Primary sarcoma of bone or soft tissue', 'P2'), 
('hip', 'R/O occult fractures from ER: Hip', 'P2'), 
('hip', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2');

INSERT INTO mri_rules(body_part, info, priority) VALUES
('shoulder', 'Acute joint injury tendon rupture', 'P2'),
('shoulder', 'Acute osteomyelitis', 'P1'),
('shoulder', 'Brachail plexus', 'P4'),
('shoulder', 'Brachail plexus query tumor', 'P4'),
('shoulder', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3B'),
('shoulder', 'Chronic joint pain', 'P4'),
('shoulder', 'Chronic Osteomyelitis', 'P2'),
('shoulder', 'Impingement', 'P4'),
('shoulder', 'Joint Injury (ie. labrum)', 'P4'),
('shoulder', 'Labral tear query', 'P4'),
('shoulder', 'Metastatic workup', 'P3A'), 
('shoulder', 'Primary sarcoma of bone or soft tissue', 'P2'), 
('shoulder', 'Rotator cuff query tear', 'P3C'), 
('shoulder', 'SLAP tear Query (arthrogram)', 'P4'), 
('shoulder', 'Supraspinatus tendon', 'P4'), 
('shoulder', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2');

INSERT INTO mri_rules(body_part, info, priority) VALUES
('wrist / hand', 'Acute joint injury tendon rupture', 'P2'),
('wrist / hand', 'Acute osteomyelitis', 'P1'),
('wrist / hand', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3B'),
('wrist / hand', 'Chronic joint pain', 'P4'),
('wrist / hand', 'Chronic Osteomyelitis', 'P2'),
('wrist / hand', 'Joint Injury', 'P4'),
('wrist / hand', 'Metastatic workup', 'P3A'), 
('wrist / hand', 'Primary sarcoma of bone or soft tissue', 'P2'), 
('wrist / hand', 'R/O occult fractures from ER: scaphoid', 'P2'), 
('wrist / hand', 'TFCC (Traingular fibrocartilage complex) wrist tear','P4'), 
('wrist / hand', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2');

INSERT INTO mri_rules(body_part, info, priority) VALUES
('foot', 'Acute joint injury tendon rupture', 'P2'),
('foot', 'Acute osteomyelitis', 'P1'),
('foot', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3B'),
('foot', 'Chronic joint pain', 'P4'),
('foot', 'Chronic Osteomyelitis', 'P2'),
('foot', 'Foot Query Mortens Neuroma', 'P4'),
('foot', 'Joint Injury','P4'),
('foot', 'Metastatic workup', 'P3A'), 
('foot', 'Primary sarcoma of bone or soft tissue', 'P2'), 
('foot', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2');

INSERT INTO mri_rules(body_part, info, priority) VALUES
('c-spine', 'Acute joint injury tendon rupture', 'P2'),
('c-spine', 'Acute osteomyelitis', 'P1'),
('c-spine', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3B'),
('c-spine', 'Chronic joint pain', 'P4'),
('c-spine', 'Chronic Osteomyelitis', 'P2'),
('c-spine', 'Brachail plexus', 'P4'),
('c-spine', 'Brachail plexus query tumor', 'P4'),
('c-spine', 'Joint Injury', 'P4'),
('c-spine', 'Metastatic workup', 'P3A'), 
('c-spine', 'Primary sarcoma of bone or soft tissue', 'P2'), 
('c-spine', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2');

INSERT INTO mri_rules(body_part, info, priority) VALUES
('elbow', 'Acute joint injury tendon rupture', 'P2'),
('elbow', 'Acute osteomyelitis', 'P1'),
('elbow', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3B'),
('elbow', 'Chronic joint pain', 'P4'),
('elbow', 'Chronic Osteomyelitis', 'P2'),
('elbow', 'Joint Injury', 'P4'),
('elbow', 'Metastatic workup', 'P3A'), 
('elbow', 'Primary sarcoma of bone or soft tissue', 'P2'), 
('elbow', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2');

INSERT INTO mri_rules(body_part, info, priority) VALUES
('ankle', 'Acute joint injury/tendon rupture', 'P2'),
('ankle', 'Acute osteomyelitis', 'P1'),
('ankle', 'Characterization soft tissue mass, likely benign (lipoma)', 'P3B'),
('ankle', 'Chronic joint pain', 'P4'),
('ankle', 'Chronic Osteomyelitis', 'P2'),
('ankle', 'Joint Injury', 'P4'),
('ankle', 'Metastatic workup', 'P3A'), 
('ankle', 'Primary sarcoma of bone or soft tissue', 'P2'), 
('ankle', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', 'P2');

UPDATE mri_rules 
SET bp_tk = to_tsvector(body_part);

\copy word_weights FROM 'C:\Users\jackhou\Documents\mri_project\mri_app\csv\a_keywords.csv' DELIMITER ',' CSV;
\copy word_weights FROM 'C:\Users\jackhou\Documents\mri_project\mri_app\csv\b_keywords.csv' DELIMITER ',' CSV;
\copy word_weights FROM 'C:\Users\jackhou\Documents\mri_project\mri_app\csv\connectors_keywords.csv' DELIMITER ',' CSV;

UPDATE word_weights
SET word = TRIM(word); 
