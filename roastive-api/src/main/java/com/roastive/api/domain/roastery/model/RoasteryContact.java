package com.roastive.api.domain.roastery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "roastery_contact")
public class RoasteryContact {
    @Id
    @Column(name = "contact_id", nullable = false, columnDefinition = "uuid")
    private UUID contactId;

    @Column(name = "roastery_id", nullable = false, columnDefinition = "uuid")
    private UUID roasteryId;

    @Column(name = "contact_name", nullable = false, length = 160)
    private String contactName;

    @Column(name = "position", length = 160)
    private String position;

    @Column(name = "phone", length = 64)
    private String phone;

    @Column(name = "email", length = 160)
    private String email;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public UUID getContactId() { return contactId; }
    public void setContactId(UUID contactId) { this.contactId = contactId; }
    public UUID getRoasteryId() { return roasteryId; }
    public void setRoasteryId(UUID roasteryId) { this.roasteryId = roasteryId; }
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isPrimary() { return isPrimary; }
    public void setPrimary(boolean primary) { isPrimary = primary; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}


