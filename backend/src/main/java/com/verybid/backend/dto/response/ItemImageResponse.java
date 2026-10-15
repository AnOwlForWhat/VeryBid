package com.verybid.backend.dto.response;

import com.verybid.backend.model.entity.ItemImage;
import com.verybid.backend.model.enums.ImageAngle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemImageResponse {

    private Long id;
    private String imageUrl;
    private ImageAngle angle;
    private Boolean isThumbnail;

    public static ItemImageResponse fromEntity(ItemImage image) {
        if (image == null) return null;
        return ItemImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .angle(image.getAngle())
                .isThumbnail(image.getIsThumbnail())
                .build();
    }
}
