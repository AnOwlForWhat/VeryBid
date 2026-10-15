package com.verybid.backend.dto.request;

import com.verybid.backend.model.enums.ImageAngle;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemImageDTO {

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @Builder.Default
    private ImageAngle angle = ImageAngle.FRONT;

    @Builder.Default
    private Boolean isThumbnail = false;
}
