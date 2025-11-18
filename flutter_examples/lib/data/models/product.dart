import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';

part 'product.g.dart';

@JsonSerializable()
class Product extends Equatable {
  final int id;
  final String name;
  final String sku;
  final double price;

  @JsonKey(name: 'part_number')
  final String? partNumber;

  @JsonKey(name: 'engine_model')
  final String? engineModel;

  final String? manufacturer;
  final String? unit;

  @JsonKey(name: 'min_stock_level')
  final int? minStockLevel;

  final String? description;
  final double? cost;

  @JsonKey(name: 'category_id')
  final int? categoryId;

  @JsonKey(name: 'image_url')
  final String? imageUrl;

  @JsonKey(name: 'is_active')
  final bool isActive;

  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  const Product({
    required this.id,
    required this.name,
    required this.sku,
    required this.price,
    this.partNumber,
    this.engineModel,
    this.manufacturer,
    this.unit,
    this.minStockLevel,
    this.description,
    this.cost,
    this.categoryId,
    this.imageUrl,
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) =>
      _$ProductFromJson(json);

  Map<String, dynamic> toJson() => _$ProductToJson(this);

  Product copyWith({
    int? id,
    String? name,
    String? sku,
    double? price,
    String? partNumber,
    String? engineModel,
    String? manufacturer,
    String? unit,
    int? minStockLevel,
    String? description,
    double? cost,
    int? categoryId,
    String? imageUrl,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      sku: sku ?? this.sku,
      price: price ?? this.price,
      partNumber: partNumber ?? this.partNumber,
      engineModel: engineModel ?? this.engineModel,
      manufacturer: manufacturer ?? this.manufacturer,
      unit: unit ?? this.unit,
      minStockLevel: minStockLevel ?? this.minStockLevel,
      description: description ?? this.description,
      cost: cost ?? this.cost,
      categoryId: categoryId ?? this.categoryId,
      imageUrl: imageUrl ?? this.imageUrl,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        sku,
        price,
        partNumber,
        engineModel,
        manufacturer,
        unit,
        minStockLevel,
        description,
        cost,
        categoryId,
        imageUrl,
        isActive,
        createdAt,
        updatedAt,
      ];
}
