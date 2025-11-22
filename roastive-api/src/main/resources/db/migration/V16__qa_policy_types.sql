-- Align roastery_qa_policy numeric columns with JPA Double (float8)
ALTER TABLE roastery_qa_policy
    ALTER COLUMN color_whole_min TYPE double precision USING color_whole_min::double precision,
    ALTER COLUMN color_whole_max TYPE double precision USING color_whole_max::double precision,
    ALTER COLUMN color_ground_min TYPE double precision USING color_ground_min::double precision,
    ALTER COLUMN color_ground_max TYPE double precision USING color_ground_max::double precision,
    ALTER COLUMN moisture_max TYPE double precision USING moisture_max::double precision,
    ALTER COLUMN cupping_score_min TYPE double precision USING cupping_score_min::double precision;


